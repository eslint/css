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

/*
 * Matches a generic font family as a whole word, for the single value `font`
 * branch that searches the shorthand where the family sits next to the size.
 * A name such as `MySerifFont` must not match.
 */
const genericFontPattern = new RegExp(
	String.raw`(?<![\w-])(?:${[...genericFonts].join("|")})(?![\w-])`,
	"iu",
);

/**
 * Check if the name is a generic font family.
 * Generic font families are keywords, so they are matched case-insensitively.
 * @param {string} name The name to check.
 * @returns {boolean} True if the name is a generic font family, false otherwise.
 */
function isGenericFont(name) {
	return genericFonts.has(name.toLowerCase());
}

/**
 * Check if the value is a CSS-wide keyword.
 * @param {string} value The value to check.
 * @param {Set<string>} cssWideKeywords The CSS-wide keywords to check against.
 * @returns {boolean} True if the value is a CSS-wide keyword, false otherwise.
 */
function isCSSWideKeyword(value, cssWideKeywords) {
	return cssWideKeywords.has(value.trim().toLowerCase());
}

/**
 * Check if the node is an identifier with a CSS-wide keyword.
 * @param {Object} node The node to check.
 * @param {Set<string>} cssWideKeywords The CSS-wide keywords to check against.
 * @returns {boolean} True if the node is a CSS-wide keyword identifier, false otherwise.
 */
function isCSSWideKeywordIdentifier(node, cssWideKeywords) {
	return (
		node.type === "Identifier" &&
		isCSSWideKeyword(node.name, cssWideKeywords)
	);
}

/**
 * Check if the node is a CSS variable function.
 * @param {Object} node The node to check.
 * @returns {boolean} True if the node is a variable function, false otherwise.
 */
function isVarFunction(node) {
	return node.type === "Function" && node.name.toLowerCase() === "var";
}

/**
 * Report an error if the font property values do not have fallbacks or a generic font.
 * @param {string} fontPropertyValues The font property values to check.
 * @param {Object} context The ESLint context object.
 * @param {Object} node The CSS node being checked.
 * @param {Set<string>} cssWideKeywords The CSS-wide keywords to check against.
 * @returns {void}
 * @private
 */
function reportFontWithoutFallbacksInFontProperty(
	fontPropertyValues,
	context,
	node,
	cssWideKeywords,
) {
	if (isCSSWideKeyword(fontPropertyValues, cssWideKeywords)) {
		return;
	}

	const valueList = fontPropertyValues.split(",").map(v => v.trim());

	if (valueList.length === 1) {
		// A quoted name is a family name, not a keyword
		const unquoted = valueList[0].replace(/"[^"]*"|'[^']*'/gu, "");
		const containsGenericFont = genericFontPattern.test(unquoted);

		if (!containsGenericFont) {
			context.report({
				loc: node.loc,
				messageId: "useFallbackFonts",
			});
		}
	} else {
		if (!isGenericFont(valueList.at(-1))) {
			context.report({
				loc: node.loc,
				messageId: "useGenericFont",
			});
		}
	}
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {FontFamilyFallbacksRuleDefinition} */ ({
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
		const cssWideKeywords = new Set(
			sourceCode.lexer.cssWideKeywords.map(keyword =>
				keyword.toLowerCase(),
			),
		);
		const variableMap = new Map();

		return {
			"Rule > Block > Declaration"(node) {
				if (node.property.startsWith("--")) {
					const variableName = node.property;
					const variableValue =
						node.value.type === "Raw" && node.value.value;
					variableMap.set(variableName, variableValue);
				}
			},

			"Rule > Block > Declaration[property=/^font-family$/i] > Value"(
				node,
			) {
				const valueArr = node.children;

				if (valueArr.length === 1) {
					if (
						isCSSWideKeywordIdentifier(valueArr[0], cssWideKeywords)
					) {
						return;
					}

					if (isVarFunction(valueArr[0])) {
						const variableName =
							valueArr[0].children[0].type === "Identifier" &&
							valueArr[0].children[0].name;
						const variableValue = variableMap.get(variableName);

						if (!variableValue) {
							return;
						}

						if (isCSSWideKeyword(variableValue, cssWideKeywords)) {
							return;
						}

						const variableList = variableValue
							.split(",")
							.map(v => v.trim());

						if (
							variableList.length === 1 &&
							!isGenericFont(variableList[0])
						) {
							context.report({
								loc: node.loc,
								messageId: "useFallbackFonts",
							});
						} else if (!isGenericFont(variableList.at(-1))) {
							context.report({
								loc: node.loc,
								messageId: "useGenericFont",
							});
						}
					} else {
						if (
							valueArr[0].type === "Identifier" &&
							isGenericFont(valueArr[0].name)
						) {
							return;
						}

						context.report({
							loc: node.loc,
							messageId: "useFallbackFonts",
						});
					}
				} else {
					const isUsingVariable = valueArr.some(child =>
						isVarFunction(child),
					);

					if (isUsingVariable) {
						const fontsList = [];
						const lastNode = valueArr.at(-1);

						if (isVarFunction(lastNode)) {
							const variableName =
								lastNode.children[0].type === "Identifier" &&
								lastNode.children[0].name;
							const lastVariable = variableMap.get(variableName);

							if (!lastVariable) {
								return;
							}
						}

						valueArr.forEach(child => {
							if (child.type === "String") {
								// Keep the quotes so it is not read as a keyword
								fontsList.push(sourceCode.getText(child));
							}

							if (child.type === "Identifier") {
								fontsList.push(child.name);
							}

							if (isVarFunction(child)) {
								const variableName =
									child.children[0].type === "Identifier" &&
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
							!isGenericFont(fontsList.at(-1))
						) {
							context.report({
								loc: node.loc,
								messageId: "useGenericFont",
							});
						}
					} else {
						const lastFont = valueArr.at(-1);

						if (!(
							lastFont.type === "Identifier" &&
							isGenericFont(lastFont.name)
						)) {
							context.report({
								loc: node.loc,
								messageId: "useGenericFont",
							});
						}
					}
				}
			},

			"Rule > Block > Declaration[property=/^font$/i] > Value"(node) {
				const valueArr = node.children;

				if (valueArr.length === 1) {
					const firstValue = valueArr[0];

					// If it font is set to system font, we don't need to check for fallbacks
					if (firstValue.type === "Identifier") {
						return;
					}

					// If the value is a variable function, we need to check the variable value
					if (isVarFunction(firstValue)) {
						// Check if the function is a variable
						const variableName =
							firstValue.children[0].type === "Identifier" &&
							firstValue.children[0].name;
						const variableValue = variableMap.get(variableName);

						if (!variableValue) {
							return;
						}

						reportFontWithoutFallbacksInFontProperty(
							variableValue,
							context,
							node,
							cssWideKeywords,
						);
					}
				} else {
					const isUsingVariable = valueArr.some(child =>
						isVarFunction(child),
					);

					if (isUsingVariable) {
						const beforOperator = [];
						const afterOperator = [];

						const operator = valueArr.find(
							child =>
								child.type === "Operator" &&
								child.value === ",",
						);
						const operatorOffset =
							operator && operator.loc.end.offset;

						if (operatorOffset) {
							valueArr.forEach(child => {
								if (child.loc.end.offset < operatorOffset) {
									beforOperator.push(
										sourceCode.getText(child).trim(),
									);
								} else if (
									child.loc.end.offset > operatorOffset
								) {
									afterOperator.push(
										sourceCode.getText(child).trim(),
									);
								}
							});

							if (afterOperator.length !== 0) {
								const usingVar = afterOperator.some(value =>
									value.toLowerCase().startsWith("var"),
								);

								if (!usingVar) {
									if (!isGenericFont(afterOperator.at(-1))) {
										context.report({
											loc: node.loc,
											messageId: "useGenericFont",
										});
									}
								} else {
									if (
										afterOperator
											.at(-1)
											.toLowerCase()
											.startsWith("var")
									) {
										const lastNode = valueArr.at(-1);
										const isFunctionVar =
											isVarFunction(lastNode);
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

										const variableList = variableValue
											.split(",")
											.map(v => v.trim());

										if (
											variableList.length > 0 &&
											!isGenericFont(variableList.at(-1))
										) {
											context.report({
												loc: node.loc,
												messageId: "useGenericFont",
											});
										}
									} else {
										if (
											!isGenericFont(afterOperator.at(-1))
										) {
											context.report({
												loc: node.loc,
												messageId: "useGenericFont",
											});
										}
									}
								}
							}
						} else {
							if (
								sourceCode
									.getText(valueArr.at(-1))
									.trim()
									.toLowerCase()
									.startsWith("var")
							) {
								const lastNode = valueArr.at(-1);
								const isFunctionVar = isVarFunction(lastNode);
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
									cssWideKeywords,
								);
							} else {
								if (
									!isGenericFont(
										sourceCode
											.getText(valueArr.at(-1))
											.trim(),
									)
								) {
									context.report({
										loc: node.loc,
										messageId: "useFallbackFonts",
									});
								}
							}
						}
					} else {
						const fontPropertyValues = sourceCode.getText(node);

						if (fontPropertyValues) {
							reportFontWithoutFallbacksInFontProperty(
								fontPropertyValues,
								context,
								node,
								cssWideKeywords,
							);
						}
					}
				}
			},
		};
	},
});
