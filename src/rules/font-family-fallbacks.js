/**
 * @fileoverview Rule to enforce the use of fallback fonts and a generic font last.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"useFallbackFonts" | "useGenericFont"} FontFamilyFallbacksMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: FontFamilyFallbacksMessageIds }>} FontFamilyFallbacksRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const genericFonts = new Set([
	"serif",
	"sans-serif",
	"monospace",
	"cursive",
	"fantasy",
	"system-ui",
	"ui-serif",
	"ui-sans-serif",
	"ui-monospace",
	"ui-rounded",
	"emoji",
	"math",
	"fangsong",
]);

/**
 * Check if the node is a CSS variable function.
 * @param {Object} node The node to check.
 * @returns {boolean} True if the node is a variable function, false otherwise.
 */
function isVarFunction(node) {
	return node.type === "Function" && node.name === "var";
}

/**
 * Report an error if the font property values do not have fallbacks or a generic font.
 * @param {string} fontPropertyValues The font property values to check.
 * @param {Object} context The ESLint context object.
 * @param {Object} node The CSS node being checked.
 * @returns {void}
 * @private
 */
function reportFontWithoutFallbacksInFontProperty(
	fontPropertyValues,
	context,
	node,
) {
	const valueList = fontPropertyValues.split(",").map(v => v.trim());

	if (valueList.length === 1) {
		const containsGenericFont = Array.from(genericFonts).some(font =>
			valueList[0].includes(font),
		);

		if (!containsGenericFont) {
			context.report({
				loc: node.value.loc,
				messageId: "useFallbackFonts",
			});
		}
	} else {
		if (!genericFonts.has(valueList.at(-1))) {
			context.report({
				loc: node.value.loc,
				messageId: "useGenericFont",
			});
		}
	}
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/**
 * @type {FontFamilyFallbacksRuleDefinition}
 */
export default {
	meta: {
		type: "suggestion",

		docs: {
			description:
				"Enforce use of fallback fonts and a generic font last",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/font-family-fallbacks.md",
		},

		messages: {
			useFallbackFonts: "Use fallback fonts and a generic font last.",
			useGenericFont: "Use a generic font last.",
		},
	},

	create(context) {
		const sourceCode = context.sourceCode;
		const variableMap = new Map();

		return {
			Rule(node) {
				if (
					node.prelude.type === "SelectorList" &&
					node.prelude.children[0].type === "Selector" &&
					node.prelude.children[0].children[0].type ===
						"PseudoClassSelector" &&
					node.prelude.children[0].children[0].name === "root"
				) {
					node?.block?.children.forEach(child => {
						if (child.type === "Declaration") {
							const variableName = child.property;
							const variableValue =
								child.value.type === "Raw" && child.value.value;

							variableMap.set(variableName, variableValue);
						}
					});
				}
			},

			Declaration(node) {
				if (node.property === "font-family") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						if (node.value.children.length === 1) {
							if (
								node.value.children[0].type === "Function" &&
								node.value.children[0].name === "var"
							) {
								const variableName =
									node.value.children[0].children[0].type ===
										"Identifier" &&
									node.value.children[0].children[0].name;
								const variableValue =
									variableMap.get(variableName);

								if (!variableValue) {
									return;
								}

								const variableList = variableValue
									.split(",")
									.map(v => v.trim());

								if (
									variableList.length === 1 &&
									!genericFonts.has(variableList[0])
								) {
									context.report({
										loc: node.value.loc,
										messageId: "useFallbackFonts",
									});
								} else if (
									!genericFonts.has(variableList.at(-1))
								) {
									context.report({
										loc: node.value.loc,
										messageId: "useGenericFont",
									});
								}
							} else {
								if (
									node.value.children[0].type ===
										"Identifier" &&
									genericFonts.has(
										node.value.children[0].name,
									)
								) {
									return;
								}

								context.report({
									loc: node.value.loc,
									messageId: "useFallbackFonts",
								});
							}
						} else {
							const isUsingVariable = node.value.children.some(
								child => isVarFunction(child),
							);

							if (isUsingVariable) {
								const fontsList = [];
								const lastNode = node.value.children.at(-1);

								if (
									lastNode.type === "Function" &&
									lastNode.name === "var"
								) {
									const variableName =
										lastNode.children[0].type ===
											"Identifier" &&
										lastNode.children[0].name;
									const lastVariable =
										variableMap.get(variableName);

									if (!lastVariable) {
										return;
									}
								}

								node.value.children.forEach(child => {
									if (child.type === "String") {
										fontsList.push(child.value);
									}

									if (child.type === "Identifier") {
										fontsList.push(child.name);
									}

									if (
										child.type === "Function" &&
										child.name === "var"
									) {
										const variableName =
											child.children[0].type ===
												"Identifier" &&
											child.children[0].name;
										const variableValue =
											variableMap.get(variableName);

										if (variableValue) {
											const variableList = variableValue
												.split(",")
												.map(v => v.trim());
											fontsList.push(...variableList);
										}
									}
								});

								if (
									fontsList.length > 0 &&
									!genericFonts.has(fontsList.at(-1))
								) {
									context.report({
										loc: node.value.loc,
										messageId: "useGenericFont",
									});
								}
							} else {
								const lastFont = node.value.children.at(-1);

								if (
									!(
										lastFont.type === "Identifier" &&
										genericFonts.has(lastFont.name)
									)
								) {
									context.report({
										loc: node.value.loc,
										messageId: "useGenericFont",
									});
								}
							}
						}
					}
				}

				if (node.property === "font") {
					if (node.value.type === "Value") {
						if (node.value.children.length === 1) {
							// If it font is set to system font, we don't need to check for fallbacks
							if (node.value.children[0].type === "Identifier") {
								return;
							}

							// If the value is a variable function, we need to check the variable value
							if (
								node.value.children[0].type === "Function" &&
								node.value.children[0].name === "var"
							) {
								// Check if the function is a variable
								const variableName =
									node.value.children[0].children[0].type ===
										"Identifier" &&
									node.value.children[0].children[0].name;
								const variableValue =
									variableMap.get(variableName);

								if (!variableValue) {
									return;
								}

								reportFontWithoutFallbacksInFontProperty(
									variableValue,
									context,
									node,
								);
							}
						} else {
							const isUsingVariable = node.value.children.some(
								child => isVarFunction(child),
							);

							if (isUsingVariable) {
								const beforOperator = [];
								const afterOperator = [];

								const operator = node.value.children.find(
									child =>
										child.type === "Operator" &&
										child.value === ",",
								);
								const operatorOffset =
									operator && operator.loc.end.offset;

								if (operatorOffset) {
									node.value.children.forEach(child => {
										if (
											child.loc.end.offset <
											operatorOffset
										) {
											beforOperator.push(
												sourceCode
													.getText(child)
													.trim(),
											);
										} else if (
											child.loc.end.offset >
											operatorOffset
										) {
											afterOperator.push(
												sourceCode
													.getText(child)
													.trim(),
											);
										}
									});

									if (afterOperator.length !== 0) {
										const usingVar = afterOperator.some(
											value => value.startsWith("var"),
										);

										if (!usingVar) {
											if (
												!genericFonts.has(
													afterOperator.at(-1),
												)
											) {
												context.report({
													loc: node.value.loc,
													messageId: "useGenericFont",
												});
											}
										} else {
											if (
												afterOperator
													.at(-1)
													.startsWith("var")
											) {
												const lastNode =
													node.value.children.at(-1);
												const isFunctionVar =
													lastNode.type ===
														"Function" &&
													lastNode.name === "var";
												const variableName =
													isFunctionVar &&
													lastNode.children[0]
														.type ===
														"Identifier" &&
													lastNode.children[0].name;
												const variableValue =
													variableMap.get(
														variableName,
													);

												if (!variableValue) {
													return;
												}

												const variableList =
													variableValue
														.split(",")
														.map(v => v.trim());

												if (
													variableList.length > 0 &&
													!genericFonts.has(
														variableList.at(-1),
													)
												) {
													context.report({
														loc: node.value.loc,
														messageId:
															"useGenericFont",
													});
												}
											} else {
												if (
													!genericFonts.has(
														afterOperator.at(-1),
													)
												) {
													context.report({
														loc: node.value.loc,
														messageId:
															"useGenericFont",
													});
												}
											}
										}
									}
								} else {
									if (
										sourceCode
											.getText(node.value.children.at(-1))
											.trim()
											.startsWith("var")
									) {
										const lastNode =
											node.value.children.at(-1);
										const isFunctionVar =
											lastNode.type === "Function" &&
											lastNode.name === "var";
										const variableName =
											isFunctionVar &&
											lastNode.children[0].type ===
												"Identifier" &&
											lastNode.children[0].name;

										const variableValue =
											variableMap.get(variableName);

										if (!variableValue) {
											return;
										}

										reportFontWithoutFallbacksInFontProperty(
											variableValue,
											context,
											node,
										);
									} else {
										if (
											!genericFonts.has(
												sourceCode
													.getText(
														node.value.children.at(
															-1,
														),
													)
													.trim(),
											)
										) {
											context.report({
												loc: node.value.loc,
												messageId: "useFallbackFonts",
											});
										}
									}
								}
							} else {
								const fontPropertyValues = sourceCode.getText(
									node.value,
								);

								if (fontPropertyValues) {
									reportFontWithoutFallbacksInFontProperty(
										fontPropertyValues,
										context,
										node,
									);
								}
							}
						}
					}
				}
			},
		};
	},
};
