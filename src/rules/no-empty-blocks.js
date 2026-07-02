/**
 * @fileoverview Rule to prevent empty blocks in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"emptyBlock" | "deleteEmptyBlock"} NoEmptyBlocksMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoEmptyBlocksMessageIds }>} NoEmptyBlocksRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoEmptyBlocksRuleDefinition} */ ({
	meta: {
		type: "problem",

		hasSuggestions: true,

		docs: {
			description: "Disallow empty blocks",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-empty-blocks.md",
		},

		messages: {
			emptyBlock: "Unexpected empty block found.",
			deleteEmptyBlock: "Delete the empty block.",
		},
	},

	create(context) {
		return {
			Block(node) {
				if (node.children.length === 0) {
					context.report({
						loc: node.loc,
						messageId: "emptyBlock",
						suggest: [
							{
								messageId: "deleteEmptyBlock",
								fix(fixer) {
									const parent =
										context.sourceCode.getParent(node);
									const isAtLayer =
										parent.type === "Atrule" &&
										parent.name === "layer";

									return fixer.remove(
										isAtLayer ? node : parent,
									);
								},
							},
						],
					});
				}
			},
		};
	},
});
