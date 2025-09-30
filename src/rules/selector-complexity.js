/**
 * @fileoverview Rule to limit and disallow CSS selectors.
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

/**
 * Get the location of a selector of a given name.
 * @param {Array<Object>} allSelector All CSS selector nodes.
 * @param {string} disallowedSelector The name of the disallowed selector.
 * @returns {Object} The location of the disallowed selector.
 */
function getDisallowedSelectorsLocation(allSelector, disallowedSelector) {
	return allSelector.find(selector => selector.name === disallowedSelector)
		.loc;
}

/**
 * An error for exceeding the maximum allowed selectors of a specific type.
 * @param {Object} context The ESLint rule context object.
 * @param {Object} selectorLoc The location of the selector.
 * @param {number} maxValue The max number of selectors that are allowed.
 * @param {string} selectorType The type of CSS selector.
 * @returns {void}
 */
function exceedLimitError(context, selectorLoc, maxValue, selectorType) {
	context.report({
		loc: selectorLoc,
		messageId: "maxSelectors",
		data: {
			selector: selectorType,
			limit: String(maxValue),
		},
	});
}

/**
 * Gives an array of CSS selectors of a specific type.
 * @param {Array<Object>} selectors All CSS selectors nodes.
 * @param {string} selectorType The type of CSS selector to filter out.
 * @returns {Array<Object>} Filtered selectors.
 */
function getSelectors(selectors, selectorType) {
	return selectors.filter(selector => selector.type === selectorType);
}

/**
 * Get the names of all CSS selectors.
 * @param {Array<Object>} selectors All CSS selector nodes.
 * @returns {Array<string>} Array of selector names.
 */
function getSelectorNames(selectors) {
	return selectors.map(selector => selector.name);
}

/**
 * Get the location of the attribute matcher or operator in a given attribute selector.
 * @param {Array<Object>} selectors All CSS selector nodes.
 * @param {number} index The index of the attribute selector in the selectors array.
 * @returns {{ startLoc: Object, endLoc: Object }} The start and end locations of the operator.
 */
function getOperatorLocation(selectors, index) {
	const selector = selectors[index];
	let startLoc;
	let endLoc;

	if (selector.name.type === "Identifier") {
		startLoc = selector.name.loc.end;
	}

	if (selector.value) {
		endLoc = selector.value.loc.start;
	}

	return { startLoc, endLoc };
}

/**
 * Get the location of a given disallowed combinator.
 * @param {Array<Object>} selectors All CSS selector nodes.
 * @param {Array<Object>} combinatorNodes All combinator nodes.
 * @param {string} combinator Name of combinator.
 * @param {number} index The index of the given combinator.
 * @returns {Object} The location of the disallowed combinator.
 */
function getDisallowedCombinatorsLocation(
	selectors,
	combinatorNodes,
	combinator,
	index,
) {
	let location;

	if (combinator === " ") {
		const selectorsArr = [];
		let selectorsGroup = [];

		selectors.forEach(selector => {
			if (selector.type === "Combinator") {
				selectorsArr.push(selectorsGroup);
				selectorsGroup = [];
			} else {
				selectorsGroup.push(selector);
			}
		});

		if (selectorsGroup.length > 0) {
			selectorsArr.push(selectorsGroup);
		}

		location = {
			start: selectorsArr[index].at(-1).loc.end,
			end: selectorsArr[index + 1][0].loc.start,
		};
	} else {
		const currentCombinatorNode = combinatorNodes[index];
		location = currentCombinatorNode.loc;
	}

	return location;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {SelectorComplexityRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow and limit CSS selectors",
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
				const selectorLoc = node.loc;

				const idSelectors = getSelectors(selectors, "IdSelector");
				const classSelectors = getSelectors(selectors, "ClassSelector");
				const typeSelectors = selectors.filter(
					child =>
						child.type === "TypeSelector" && child.name !== "*",
				);
				const attributeSelectors = getSelectors(
					selectors,
					"AttributeSelector",
				);
				const pseudoClassSelectors = getSelectors(
					selectors,
					"PseudoClassSelector",
				);
				const universalSelectors = selectors.filter(
					child =>
						child.type === "TypeSelector" && child.name === "*",
				);
				const combinatorNodes = getSelectors(selectors, "Combinator");

				const combinators = getSelectorNames(combinatorNodes);
				const pseudoClassSelectorsNames =
					getSelectorNames(pseudoClassSelectors);
				const pseudoElementSelectors = getSelectors(
					selectors,
					"PseudoElementSelector",
				);
				const pseudoElementNames = getSelectorNames(
					pseudoElementSelectors,
				);
				const attributeNames = attributeSelectors.map(s => s.name.name);
				const attributeMatchers = attributeSelectors
					.map(child => child.matcher)
					.filter(Boolean);

				if (idSelectors.length > maxIds) {
					exceedLimitError(context, selectorLoc, maxIds, "id");
				}

				if (classSelectors.length > maxClasses) {
					exceedLimitError(context, selectorLoc, maxClasses, "class");
				}

				if (typeSelectors.length > maxTypes) {
					exceedLimitError(context, selectorLoc, maxTypes, "type");
				}

				if (attributeSelectors.length > maxAttributes) {
					exceedLimitError(
						context,
						selectorLoc,
						maxAttributes,
						"attribute",
					);
				}

				if (pseudoClassSelectors.length > maxPseudoClasses) {
					exceedLimitError(
						context,
						selectorLoc,
						maxPseudoClasses,
						"pseudo-class",
					);
				}

				if (universalSelectors.length > maxUniversals) {
					exceedLimitError(
						context,
						selectorLoc,
						maxUniversals,
						"universal",
					);
				}

				if (combinatorNodes.length > maxCombinators) {
					exceedLimitError(
						context,
						selectorLoc,
						maxCombinators,
						"combinator",
					);
				}

				if (combinatorNodes.length + 1 > maxCompounds) {
					exceedLimitError(
						context,
						selectorLoc,
						maxCompounds,
						"compound",
					);
				}

				if (disallowPseudoClasses.length > 0) {
					let disallowedPseudoClassLocation;
					for (const pseudoClassName of pseudoClassSelectorsNames) {
						if (disallowPseudoClasses.includes(pseudoClassName)) {
							disallowedPseudoClassLocation =
								getDisallowedSelectorsLocation(
									pseudoClassSelectors,
									pseudoClassName,
								);
							context.report({
								loc: disallowedPseudoClassLocation,
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
					let disallowedCombinatorLocation;
					for (const [index, combinator] of combinators.entries()) {
						if (disallowCombinators.includes(combinator)) {
							disallowedCombinatorLocation =
								getDisallowedCombinatorsLocation(
									selectors,
									combinatorNodes,
									combinator,
									index,
								);
							context.report({
								loc: disallowedCombinatorLocation,
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
					let disallowPseudoElementsLocation;
					for (const pseudoElement of pseudoElementNames) {
						if (disallowPseudoElements.includes(pseudoElement)) {
							disallowPseudoElementsLocation =
								getDisallowedSelectorsLocation(
									pseudoElementSelectors,
									pseudoElement,
								);
							context.report({
								loc: disallowPseudoElementsLocation,
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
					let disallowAttributesLocation;
					for (const attributeName of attributeNames) {
						if (disallowAttributes.includes(attributeName)) {
							disallowAttributesLocation =
								attributeSelectors.find(
									selector =>
										selector.name.name === attributeName,
								).name.loc;
							context.report({
								loc: disallowAttributesLocation,
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
					for (const [
						index,
						attributeMatcher,
					] of attributeMatchers.entries()) {
						if (
							disallowAttributeMatchers.includes(attributeMatcher)
						) {
							const { startLoc, endLoc } = getOperatorLocation(
								attributeSelectors.filter(s => s.matcher),
								index,
							);

							context.report({
								loc: {
									start: startLoc,
									end: endLoc,
								},
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
