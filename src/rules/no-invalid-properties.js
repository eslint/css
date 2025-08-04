/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { isSyntaxMatchError, isSyntaxReferenceError } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { ValuePlain, FunctionNodePlain, CssLocationRange } from "@eslint/css-tree";
 * @typedef {"invalidPropertyValue" | "unknownProperty" | "unknownVar"} NoInvalidPropertiesMessageIds
 * @typedef {[{allowUnknownVariables?: boolean}]} NoInvalidPropertiesOptions
 * @typedef {CSSRuleDefinition<{ RuleOptions: NoInvalidPropertiesOptions, MessageIds: NoInvalidPropertiesMessageIds }>} NoInvalidPropertiesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Extracts the list of fallback value or variable name used in a `var()` that is used as fallback function.
 * For example, for `var(--my-color, var(--fallback-color, red));` it will return `["--fallback-color", "red"]`.
 * @param {string} value The fallback value that is used in `var()`.
 * @return {Array<string>} The list of variable names of fallback value.
 */
function getVarFallbackList(value) {
	const list = [];
	let currentValue = value;

	while (true) {
		const match = currentValue.match(
			/var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)/u,
		);

		if (!match) {
			break;
		}

		const prop = match[1].trim();
		const fallback = match[2]?.trim();

		list.push(prop);

		if (!fallback) {
			break;
		}

		// If fallback is not another var(), we're done
		if (!fallback.includes("var(")) {
			list.push(fallback);
			break;
		}

		// Continue parsing from fallback
		currentValue = fallback;
	}

	return list;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoInvalidPropertiesRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid properties",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-properties.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowUnknownVariables: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowUnknownVariables: false,
			},
		],

		messages: {
			invalidPropertyValue:
				"Invalid value '{{value}}' for property '{{property}}'. Expected {{expected}}.",
			unknownProperty: "Unknown property '{{property}}' found.",
			unknownVar: "Can't validate with unknown variable '{{var}}'.",
		},
	},

	create(context) {
		const sourceCode = context.sourceCode;
		const lexer = sourceCode.lexer;

		/** @type {Map<string,ValuePlain>} */
		const vars = new Map();

		/**
		 * We need to track this as a stack because we can have nested
		 * rules that use the `var()` function, and we need to
		 * ensure that we validate the innermost rule first.
		 * @type {Array<Map<string,FunctionNodePlain>>}
		 */
		const replacements = [];

		const [{ allowUnknownVariables }] = context.options;

		/**
		 * Process a var function node and add its resolved value to the value list
		 * @param {Object} varNode The var function node
		 * @param {string[]} valueList Array to collect processed values
		 * @param {Map<string,CssLocationRange>} valuesWithVarLocs Map of values to their locations
		 * @returns {boolean} Whether processing was successful
		 */
		function processVarFunction(varNode, valueList, valuesWithVarLocs) {
			const varValue = vars.get(varNode.children[0].name);

			if (varValue) {
				const varValueText = sourceCode.getText(varValue).trim();
				valueList.push(varValueText);
				valuesWithVarLocs.set(varValueText, varNode.loc);
				return true;
			}

			// If the variable is not found and doesn't have a fallback value, report it
			if (varNode.children.length === 1) {
				if (!allowUnknownVariables) {
					context.report({
						loc: varNode.children[0].loc,
						messageId: "unknownVar",
						data: { var: varNode.children[0].name },
					});
					return false;
				}
				return true;
			}

			// Handle fallback values
			if (varNode.children[2].type !== "Raw") {
				return true;
			}

			const fallbackVarList = getVarFallbackList(
				varNode.children[2].value.trim(),
			);

			if (fallbackVarList.length === 0) {
				const fallbackValue = varNode.children[2].value.trim();
				valueList.push(fallbackValue);
				valuesWithVarLocs.set(fallbackValue, varNode.loc);
				return true;
			}

			// Process fallback variables
			for (const fallbackVar of fallbackVarList) {
				if (fallbackVar.startsWith("--")) {
					const fallbackVarValue = vars.get(fallbackVar);
					if (fallbackVarValue) {
						const fallbackValue = sourceCode
							.getText(fallbackVarValue)
							.trim();
						valueList.push(fallbackValue);
						valuesWithVarLocs.set(fallbackValue, varNode.loc);
						return true;
					}
				} else {
					valueList.push(fallbackVar.trim());
					valuesWithVarLocs.set(fallbackVar.trim(), varNode.loc);
					return true;
				}
			}

			// No valid fallback found
			if (!allowUnknownVariables) {
				context.report({
					loc: varNode.children[0].loc,
					messageId: "unknownVar",
					data: { var: varNode.children[0].name },
				});
				return false;
			}

			return true;
		}

		/**
		 * Process a nested function by recursively handling its children
		 * @param {FunctionNodePlain} funcNode The function node
		 * @param {Map<string,CssLocationRange>} valuesWithVarLocs Map of values to their locations
		 * @returns {string|null} The processed function string or null if processing failed
		 */
		function processNestedFunction(funcNode, valuesWithVarLocs) {
			const nestedValueList = [];

			for (const nestedChild of funcNode.children) {
				if (
					nestedChild.type === "Function" &&
					nestedChild.name === "var"
				) {
					if (
						!processVarFunction(
							nestedChild,
							nestedValueList,
							valuesWithVarLocs,
						)
					) {
						return null;
					}
				} else if (nestedChild.type === "Function") {
					// Recursively process nested functions
					const processedNestedFunction = processNestedFunction(
						nestedChild,
						valuesWithVarLocs,
					);
					if (!processedNestedFunction) {
						return null;
					}
					nestedValueList.push(processedNestedFunction);
				} else {
					nestedValueList.push(
						sourceCode.getText(nestedChild).trim(),
					);
				}
			}

			return `${funcNode.name}(${nestedValueList.join(" ")})`;
		}

		return {
			"Rule > Block > Declaration"() {
				replacements.push(new Map());
			},

			"Function[name=var]"(node) {
				const map = replacements.at(-1);
				if (!map) {
					return;
				}

				/*
				 * Store the custom property name and the function node
				 * so can use these to validate the value later.
				 */
				const name = node.children[0].name;
				map.set(name, node);
			},

			"Rule > Block > Declaration:exit"(node) {
				if (node.property.startsWith("--")) {
					// store the custom property name and value to validate later
					vars.set(node.property, node.value);

					// don't validate custom properties
					return;
				}

				const varsFound = replacements.pop();

				/** @type {Map<string,CssLocationRange>} */
				const valuesWithVarLocs = new Map();
				const usingVars = varsFound?.size > 0;
				let value = node.value;

				if (usingVars) {
					const valueList = [];
					const valueNodes = node.value.children;

					// When `var()` is used, we store all the values to `valueList` with the replacement of `var()` with there values or fallback values
					for (const child of valueNodes) {
						// If value is a function starts with `var()`
						if (child.type === "Function" && child.name === "var") {
							if (
								!processVarFunction(
									child,
									valueList,
									valuesWithVarLocs,
								)
							) {
								return;
							}
						} else if (child.type === "Function") {
							const processedFunction = processNestedFunction(
								child,
								valuesWithVarLocs,
							);
							if (!processedFunction) {
								return;
							}
							valueList.push(processedFunction);
						} else {
							// If the child is not a `var()` function, just add its text to the `valueList`
							const valueText = sourceCode.getText(child).trim();
							valueList.push(valueText);
							valuesWithVarLocs.set(valueText, child.loc);
						}
					}

					value =
						valueList.length > 0
							? valueList.join(" ")
							: sourceCode.getText(node.value);
				}

				const { error } = lexer.matchProperty(node.property, value);

				if (error) {
					// validation failure
					if (isSyntaxMatchError(error)) {
						const errorValue =
							usingVars &&
							value.slice(
								error.mismatchOffset,
								error.mismatchOffset + error.mismatchLength,
							);

						context.report({
							/*
							 * When using variables, check to see if the error
							 * occurred at a location where a variable was replaced.
							 * If so, use that location; otherwise, use the error's
							 * reported location.
							 */
							loc: usingVars
								? (valuesWithVarLocs.get(errorValue) ??
									node.value.loc)
								: error.loc,
							messageId: "invalidPropertyValue",
							data: {
								property: node.property,

								/*
								 * When using variables, slice the value to
								 * only include the part that caused the error.
								 * Otherwise, use the full value from the error.
								 */
								value: usingVars
									? value.slice(
											error.mismatchOffset,
											error.mismatchOffset +
												error.mismatchLength,
										)
									: error.css,
								expected: error.syntax,
							},
						});
						return;
					}

					if (
						!allowUnknownVariables ||
						isSyntaxReferenceError(error)
					) {
						// unknown property
						context.report({
							loc: {
								start: node.loc.start,
								end: {
									line: node.loc.start.line,
									column:
										node.loc.start.column +
										node.property.length,
								},
							},
							messageId: "unknownProperty",
							data: {
								property: node.property,
							},
						});
					}
				}
			},
		};
	},
};
