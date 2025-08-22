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
		 * @type {Array<{
		 *   valueParts: string[],
		 *   functionPartsStack: string[][],
		 *   valueSegmentLocs: Map<string,CssLocationRange>,
		 *   skipValidation: boolean,
		 *   hadVarSubstitution: boolean,
		 * }>}
		 */
		const declStack = [];

		const [{ allowUnknownVariables }] = context.options;

		/**
		 * Process a var function node and add its resolved value to the value list
		 * @param {Object} varNode The var() function node
		 * @param {string[]} valueList Array to collect processed values
		 * @param {Map<string,CssLocationRange>} valueSegmentLocs Map of rebuilt value segments to their locations
		 * @returns {boolean} Whether processing was successful
		 */
		function processVarFunction(varNode, valueList, valueSegmentLocs) {
			const varValue = vars.get(varNode.children[0].name);

			if (varValue) {
				const varValueText = sourceCode.getText(varValue).trim();
				valueList.push(varValueText);
				valueSegmentLocs.set(varValueText, varNode.loc);
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
				valueSegmentLocs.set(fallbackValue, varNode.loc);
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
						valueSegmentLocs.set(fallbackValue, varNode.loc);
						return true;
					}
				} else {
					valueList.push(fallbackVar.trim());
					valueSegmentLocs.set(fallbackVar.trim(), varNode.loc);
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

		return {
			"Rule > Block > Declaration"() {
				declStack.push({
					valueParts: [],
					functionPartsStack: [],
					valueSegmentLocs: new Map(),
					skipValidation: false,
					hadVarSubstitution: false,
				});
			},

			"Rule > Block > Declaration > Value > *:not(Function)"(node) {
				const state = declStack.at(-1);
				const text = sourceCode.getText(node).trim();
				state.valueParts.push(text);
				state.valueSegmentLocs.set(text, node.loc);
			},

			Function() {
				declStack.at(-1).functionPartsStack.push([]);
			},

			"Function > *:not(Function)"(node) {
				const state = declStack.at(-1);
				const parts = state.functionPartsStack.at(-1);
				const text = sourceCode.getText(node).trim();
				parts.push(text);
				state.valueSegmentLocs.set(text, node.loc);
			},

			"Function:exit"(node) {
				const state = declStack.at(-1);
				if (state.skipValidation) {
					return;
				}

				const parts = state.functionPartsStack.pop();
				let result;
				if (node.name.toLowerCase() === "var") {
					const resolvedParts = [];
					const success = processVarFunction(
						node,
						resolvedParts,
						state.valueSegmentLocs,
					);

					if (!success) {
						state.skipValidation = true;
						return;
					}

					if (resolvedParts.length === 0) {
						return;
					}

					state.hadVarSubstitution = true;
					result = resolvedParts[0];
				} else {
					result = `${node.name}(${parts.join(" ")})`;
				}

				const parentParts = state.functionPartsStack.at(-1);
				if (parentParts) {
					parentParts.push(result);
				} else {
					state.valueParts.push(result);
				}
			},

			"Rule > Block > Declaration:exit"(node) {
				const state = declStack.pop();
				if (node.property.startsWith("--")) {
					// store the custom property name and value to validate later
					vars.set(node.property, node.value);

					// don't validate custom properties
					return;
				}

				if (state.skipValidation) {
					return;
				}

				let value = node.value;
				if (state.hadVarSubstitution) {
					const valueList = state.valueParts;
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
							state.hadVarSubstitution &&
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
							loc: state.hadVarSubstitution
								? (state.valueSegmentLocs.get(errorValue) ??
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
								value: state.hadVarSubstitution
									? errorValue
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
