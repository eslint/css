/**
 * @fileoverview Rule to disallow unmatchable selectors.
 * @author TKDev7
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"unmatchableSelector"} NoUnmatchableSelectorsMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoUnmatchableSelectorsMessageIds }>} NoUnmatchableSelectorsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoUnmatchableSelectorsRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow unmatchable selectors",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-unmatchable-selectors.md",
		},

		messages: {
			unmatchableSelector:
				"Unexpected unmatchable selector '{{selector}}'.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			AnPlusB(node) {
				const a = Number(node.a);
				const b = Number(node.b);

				if (a <= 0 && b <= 0) {
					const pseudo = sourceCode.getParent(
						sourceCode.getParent(node),
					);

					context.report({
						loc: pseudo.loc,
						messageId: "unmatchableSelector",
						data: { selector: sourceCode.getText(pseudo) },
					});
				}
			},
		};
	},
};
