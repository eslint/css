/**
 * @fileoverview Rule to limit selector complexity
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"maxSelectors" | "disallowedSelectors"} SelectorComplexityMessageIds
 * @typedef {[{
 *     maxIds?: number,
 *     maxClasses?: number,
 *     maxTypes?: number,
 *     maxAttributes?: number,
 *     maxPseudoClasses?: number,
 *     maxPseudoElements?: number,
 *     maxUniversals?: number,
 *     maxCompounds?: number,
 *     maxCombinators?: number,
 *     disallowCombinators?: string[],
 *     disallowPseudoClasses?: string[],
 *     disallowPseudoElements?: string[],
 *     disallowAttributes?: string[],
 *     disallowAttributeMatchers?: string[],
 * }]} SelectorComplexityOptions
 * @typedef {CSSRuleDefinition<{ RuleOptions: SelectorComplexityOptions, MessageIds: SelectorComplexityMessageIds }> } SelectorComplexityRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

// function getSelectors(selectors, selectorType) {
//     return selectors.filter(child => child.type === selectorType);
// }

/**
 * Extract compounds from a CSS selector.
 * @param {Array<Object>} selectors All CSS selector nodes.
 * @returns {Array<Array<Object>>} Array of compounds (each compound is an array of selector nodes).
 */
function getCompounds(selectors) {
	const compounds = [];
	let compound = [];

	selectors.forEach(selector => {
		if (selector.type === "Combinator") {
			if (compound.length > 0) {
				compounds.push(compound);
				compound = [];
			}
		} else {
			compound.push(selector);
		}
	});

	if (compound.length > 0) {
		compounds.push(compound);
	}

	return compounds;
}

// function isIncluded(selectorNames, disallowedNames) {
//     return selectorNames.some(name => disallowedNames.includes(name));
// }

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {SelectorComplexityRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow and limit complex selectors",
			recommended: false,
			url: "https://github.com/eslint/css/blob/main/docs/rules/selector-complexity.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					maxIds: {
						type: "integer",
						minimum: 0,
					},
					maxClasses: {
						type: "integer",
						minimum: 0,
					},
					maxTypes: {
						type: "integer",
						minimum: 0,
					},
					maxAttributes: {
						type: "integer",
						minimum: 0,
					},
					maxPseudoClasses: {
						type: "integer",
						minimum: 0,
					},
					maxPseudoElements: {
						type: "integer",
						minimum: 0,
					},
					maxUniversals: {
						type: "integer",
						minimum: 0,
					},
					maxCompounds: {
						type: "integer",
						minimum: 0,
					},
					maxCombinators: {
						type: "integer",
						minimum: 0,
					},
					disallowCombinators: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					disallowPseudoClasses: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					disallowPseudoElements: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					disallowAttributes: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
					disallowAttributeMatchers: {
						type: "array",
						items: {
							type: "string",
						},
						uniqueItems: true,
					},
				},
			},
		],

		defaultOptions: [
			{
				maxIds: Infinity,
				maxClasses: Infinity,
				maxTypes: Infinity,
				maxAttributes: Infinity,
				maxPseudoClasses: Infinity,
				maxPseudoElements: Infinity,
				maxUniversals: Infinity,
				maxCompounds: Infinity,
				maxCombinators: Infinity,
				disallowCombinators: [],
				disallowPseudoClasses: [],
				disallowPseudoElements: [],
				disallowAttributes: [],
				disallowAttributeMatchers: [],
			},
		],

		messages: {
			maxSelectors:
				"Exceeded maximum {{selector}} selector. Only {{limit}} allowed.",
			disallowedSelectors:
				"'{{selectorName}}' {{selector}} is not allowed.",
		},
	},

	create(context) {
		const [
			{
				maxIds,
				maxClasses,
				maxTypes,
				maxAttributes,
				maxPseudoClasses,
				maxPseudoElements,
				maxUniversals,
				maxCompounds,
				maxCombinators,
				disallowCombinators,
				disallowPseudoClasses,
				disallowPseudoElements,
				disallowAttributes,
				disallowAttributeMatchers,
			},
		] = context.options;

		return {
			Selector(node) {
				const selectors = node.children;

				const idSelectors = selectors.filter(
					child => child.type === "IdSelector",
				);
				const classSelectors = selectors.filter(
					child => child.type === "ClassSelector",
				);
				const typeSelectors = selectors.filter(
					child =>
						child.type === "TypeSelector" && child.name !== "*",
				);
				const attributeSelectors = selectors.filter(
					child => child.type === "AttributeSelector",
				);
				const pseudoClassSelectors = selectors.filter(
					child => child.type === "PseudoClassSelector",
				);
				const pseudoElementSelectors = selectors.filter(
					child => child.type === "PseudoElementSelector",
				);
				const universalSelectors = selectors.filter(
					child =>
						child.type === "TypeSelector" && child.name === "*",
				);
				const combinatorNodes = selectors.filter(
					child => child.type === "Combinator",
				);
				const compounds = getCompounds(selectors);

				const combinators = combinatorNodes.map(s => s.name);
				const pseudoClassSelectorsNames = pseudoClassSelectors.map(
					s => s.name,
				);
				const pseudoElementNames = pseudoElementSelectors.map(
					s => s.name,
				);
				const attributeNames = attributeSelectors.map(s => s.name.name);
				const attributeMatchers = attributeSelectors
					.map(s => s.matcher)
					.filter(Boolean);

				if (idSelectors.length > maxIds) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "id",
							limit: String(maxIds),
						},
					});
				}

				if (classSelectors.length > maxClasses) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "class",
							limit: String(maxClasses),
						},
					});
				}

				if (typeSelectors.length > maxTypes) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "type",
							limit: String(maxTypes),
						},
					});
				}

				if (attributeSelectors.length > maxAttributes) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "attribute",
							limit: String(maxAttributes),
						},
					});
				}

				if (pseudoClassSelectors.length > maxPseudoClasses) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "pseudo-class",
							limit: String(maxPseudoClasses),
						},
					});
				}

				if (pseudoElementSelectors.length > maxPseudoElements) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "pseudo-element",
							limit: String(maxPseudoElements),
						},
					});
				}

				if (universalSelectors.length > maxUniversals) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "universal",
							limit: String(maxUniversals),
						},
					});
				}

				if (combinatorNodes.length > maxCombinators) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "combinator",
							limit: String(maxCombinators),
						},
					});
				}

				if (compounds.length > maxCompounds) {
					context.report({
						node,
						messageId: "maxSelectors",
						data: {
							selector: "compound",
							limit: String(maxCompounds),
						},
					});
				}

				if (disallowPseudoClasses.length > 0) {
					for (const pseudoClassName of pseudoClassSelectorsNames) {
						if (disallowPseudoClasses.includes(pseudoClassName)) {
							context.report({
								node,
								messageId: "disallowedSelectors",
								data: {
									selectorName: pseudoClassName,
									selector: "pseudo-class",
								},
							});
						}
					}
				}

				if (disallowCombinators.length > 0) {
					for (const combinator of combinators) {
						if (disallowCombinators.includes(combinator)) {
							context.report({
								node,
								messageId: "disallowedSelectors",
								data: {
									selectorName: combinator,
									selector: "combinator",
								},
							});
						}
					}
				}

				if (disallowPseudoElements.length > 0) {
					for (const pseudoElement of pseudoElementNames) {
						if (disallowPseudoElements.includes(pseudoElement)) {
							context.report({
								node,
								messageId: "disallowedSelectors",
								data: {
									selectorName: pseudoElement,
									selector: "pseudo-element",
								},
							});
						}
					}
				}

				if (disallowAttributes.length > 0) {
					for (const attributeName of attributeNames) {
						if (disallowAttributes.includes(attributeName)) {
							context.report({
								node,
								messageId: "disallowedSelectors",
								data: {
									selectorName: attributeName,
									selector: "attribute",
								},
							});
						}
					}
				}

				if (disallowAttributeMatchers.length > 0) {
					for (const attributeMatcher of attributeMatchers) {
						if (
							disallowAttributeMatchers.includes(attributeMatcher)
						) {
							context.report({
								node,
								messageId: "disallowedSelectors",
								data: {
									selectorName: attributeMatcher,
									selector: "attribute-matcher",
								},
							});
						}
					}
				}
			},
		};
	},
};
