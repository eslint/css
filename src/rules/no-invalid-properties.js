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
			/var\(\s*(--[^,\s)]+)\s*(?:,([\s\S]+))?\)/iu,
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
		if (!fallback.toLowerCase().includes("var(")) {
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

		return {
			"Rule > Block > Declaration"() {
				replacements.push(new Map());
			},

			"Function[name=/^var$/i]"(node) {
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
						if (
							child.type === "Function" &&
							child.name.toLowerCase() === "var"
						) {
							const varValue = vars.get(child.children[0].name);

							// If the variable is found, use its value, otherwise check for fallback values
							if (varValue) {
								const varValueText = sourceCode
									.getText(varValue)
									.trim();

								valueList.push(varValueText);
								valuesWithVarLocs.set(varValueText, child.loc);
							} else {
								// If the variable is not found and doesn't have a fallback value, report it
								if (child.children.length === 1) {
									if (!allowUnknownVariables) {
										context.report({
											loc: child.children[0].loc,
											messageId: "unknownVar",
											data: {
												var: child.children[0].name,
											},
										});

										return;
									}
								} else {
									// If it has a fallback value, use that
									if (child.children[2].type === "Raw") {
										const fallbackVarList =
											getVarFallbackList(
												child.children[2].value.trim(),
											);
										if (fallbackVarList.length > 0) {
											let gotFallbackVarValue = false;

											for (const fallbackVar of fallbackVarList) {
												if (
													fallbackVar.startsWith("--")
												) {
													const fallbackVarValue =
														vars.get(fallbackVar);

													if (!fallbackVarValue) {
														continue; // Try the next fallback
													}

													valueList.push(
														sourceCode
															.getText(
																fallbackVarValue,
															)
															.trim(),
													);
													valuesWithVarLocs.set(
														sourceCode
															.getText(
																fallbackVarValue,
															)
															.trim(),
														child.loc,
													);
													gotFallbackVarValue = true;
													break; // Stop after finding the first valid variable
												} else {
													const fallbackValue =
														fallbackVar.trim();
													valueList.push(
														fallbackValue,
													);
													valuesWithVarLocs.set(
														fallbackValue,
														child.loc,
													);
													gotFallbackVarValue = true;
													break; // Stop after finding the first non-variable fallback
												}
											}

											// If none of the fallback value is defined then report an error
											if (
												!allowUnknownVariables &&
												!gotFallbackVarValue
											) {
												context.report({
													loc: child.children[0].loc,
													messageId: "unknownVar",
													data: {
														var: child.children[0]
															.name,
													},
												});

												return;
											}
										} else {
											// if it has a fallback value, use that
											const fallbackValue =
												child.children[2].value.trim();
											valueList.push(fallbackValue);
											valuesWithVarLocs.set(
												fallbackValue,
												child.loc,
											);
										}
									}
								}
							}
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
