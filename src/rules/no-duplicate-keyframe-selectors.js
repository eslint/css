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
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {DuplicateKeyframeSelectorRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		docs: {
			description: "Disallow duplicate selectors within keyframe blocks",
			dialects: ["CSS"],
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
		const seen = new Map();

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
				const selector = node.prelude.children[0];
				const value = [];

				selector.children.forEach(component => {
					if (component.type === "Percentage") {
						value.push(`${component.value}%`);
					} else if (component.type === "TypeSelector") {
						value.push(component.name.toLowerCase());
					}
				});

				const key = value.join(" ");

				if (seen.has(key)) {
					context.report({
						loc: selector.loc,
						messageId: "duplicateKeyframeSelector",
						data: {
							selector: key,
						},
					});
				} else {
					seen.set(key, true);
				}
			},
		};
	},
});
