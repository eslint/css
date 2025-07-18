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
		let selectorNodes = [];
		return {
			"Atrule[name='keyframes']"(node) {
				selectorNodes = node.block.children.map(child => {
					const selector = child.prelude.children[0].children[0];
					let value;
					if (selector.type === "Percentage") {
						value = `${selector.value}%`;
					} else if (selector.type === "TypeSelector") {
						value = selector.name.toLowerCase();
					} else {
						value = selector.value;
					}
					return { value, loc: selector.loc };
				});
			},
			"Atrule[name=keyframes]:exit"() {
				const seen = new Map();
				selectorNodes.forEach((selectorNode, index) => {
					if (seen.has(selectorNode.value)) {
						context.report({
							loc: selectorNode.loc,
							messageId: "duplicateKeyframeSelector",
							data: {
								selector: selectorNode.value,
							},
						});
					} else {
						seen.set(selectorNode.value, index);
					}
				});
				selectorNodes = [];
			},
		};
	},
};
