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

/** @type {DuplicateKeyframeSelectorRuleDefinition} */
export default {
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
				const selector = node.prelude.children[0].children[0];
				let value;
				if (selector.type === "Percentage") {
					value = `${selector.value}%`;
				} else if (selector.type === "TypeSelector") {
					value = selector.name.toLowerCase();
				} else {
					value = selector.value;
				}

				if (seen.has(value)) {
					context.report({
						loc: selector.loc,
						messageId: "duplicateKeyframeSelector",
						data: {
							selector: value,
						},
					});
				} else {
					seen.set(value, true);
				}
			},
		};
	},
};
