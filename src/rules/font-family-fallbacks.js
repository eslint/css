/**
 * @fileoverview Rule to enforce the use of fallback fonts and a generic font last.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

// /**
//  * @import { CSSRuleDefinition } from "../types.js"
//  * @typedef {"useFallbackFonts" | "useGenericFont"} FontFamilyFallbacksMessageIds
//  * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: FontFamilyFallbacksMessageIds }>} FontFamilyFallbacksRuleDefinition
//  */

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

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

// /**
//  * @type {FontFamilyFallbacksRuleDefinition}
//  */
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
			// nodeType: "The type of node is {{typeis}}: '{{value}}'.",
		},
	},

	create(context) {
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

					// const variableName = node.block.children[0].property;
					// const variableValue = node.block.children[0].value.value;

					// variableMap.set(variableName, variableValue);
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
								const variableValue = variableMap.get(
									node.value.children[0].children[0].name,
								);

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
										loc: node.value.children[0].loc,
										messageId: "useFallbackFonts",
									});
								} else if (
									!genericFonts.has(variableList.at(-1))
								) {
									context.report({
										loc: node.value.children[0].loc,
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
									loc: node.value.children[0].loc,
									messageId: "useFallbackFonts",
								});
							}
						} else {
							const isUsingVariable = node.value.children.some(
								child =>
									child.type === "Function" &&
									child.name === "var",
							);

							if (isUsingVariable) {
								const fontsList = [];

								if (
									node.value.children.at(-1).type ===
										"Function" &&
									node.value.children.at(-1).name === "var"
								) {
									const lastVariable = variableMap.get(
										node.value.children.at(-1).children[0]
											.name,
									);

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
										const variableValue = variableMap.get(
											child.children[0].name,
										);

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
									// context.report({
									// 	loc: node.value.loc,
									// 	data: {
									// 		typeis: typeof fontsList,
									// 		value: fontsList,
									// 	},
									// 	messageId: "nodeType",
									// });
								}

								// context.report({
								// 	loc: node.value.loc,
								// 	messageId: "useGenericFont",
								// });
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

						// const getVariableName = variableMap.get(
						// 	node.value.children[0].children[0].name,
						// );

						// if (
						// 	getVariableName &&
						// 	!getVariableName.includes("sans-serif")
						// ) {
						// 	context.report({
						// 		node,
						// 		messageId: "useFallbackFonts",
						// 	});
						// }

						// context.report({
						// 	node,
						// 	data: {
						// 		typeis: typeof(variableValue),
						// 		value: variableValue,
						// 	},
						// 	messageId: "nodeType",
						// });
					}
				}
			},
		};
	},
};
