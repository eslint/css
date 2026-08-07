/**
 * @fileoverview Rule to disallow duplicate selectors within keyframe blocks.
 * @author Nitin Kumar
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"duplicateKeyframeSelector"} DuplicateKeyframeSelectorMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: DuplicateKeyframeSelectorMessageIds }>} DuplicateKeyframeSelectorRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const keyframeSelectorAliases = new Map([
	["from", "0%"],
	["to", "100%"],
]);

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {DuplicateKeyframeSelectorRuleDefinition} */ ({
	meta: {
		type: "problem",

		docs: {
			description: "Disallow duplicate selectors within keyframe blocks",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-keyframe-selectors.md",
		},

		messages: {
			duplicateKeyframeSelector:
				"Unexpected duplicate selector '{{selector}}' found within keyframe block.",
		},
	},

	create(context) {
		let insideKeyframes = false;
		const seen = new Set();

		return {
			"Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i]"() {
				insideKeyframes = true;
				seen.clear();
			},

			"Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i]:exit"() {
				insideKeyframes = false;
			},

			Rule(node) {
				if (!insideKeyframes) {
					return;
				}

				// @ts-ignore - children is a valid property for prelude
				const selectors = node.prelude.children;
				const value = [];

				selectors.forEach(selector => {
					const component = selector.children[0];
					const componentType = component.type;

					if (selector.children.length === 1) {
						if (componentType === "Percentage") {
							value.push(`${component.value}%`);
						} else if (componentType === "TypeSelector") {
							value.push(component.name.toLowerCase());
						}
					} else {
						if (
							selector.children.some(
								child => child.type === "Combinator",
							)
						) {
							if (
								componentType === "TypeSelector" &&
								selector.children[1].type === "Combinator" &&
								selector.children[2].type === "Percentage"
							) {
								value.push(
									`${component.name.toLowerCase()} ${selector.children[2].value}%`,
								);
							}
						}
					}
				});

				const keys = value.map(
					selectorPart =>
						keyframeSelectorAliases.get(selectorPart) ??
						selectorPart,
				);

				keys.forEach((key, i) => {
					if (seen.has(key)) {
						context.report({
							loc: selectors[i].loc,
							messageId: "duplicateKeyframeSelector",
							data: {
								selector: value[i],
							},
						});
					} else {
						seen.add(key);
					}
				});
			},
		};
	},
});
