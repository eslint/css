/**
 * @fileoverview Rule to prevent empty blocks in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"emptyBlock" | "removeRule" | "convertToStatement"} NoEmptyBlocksMessageIds
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
			removeRule: "Remove the empty rule.",
			convertToStatement: "Convert to layer statement.",
		},
	},

	create(context) {
		return {
			Block(node) {
				if (node.children.length === 0) {
					const parent = context.sourceCode.getParent(node);
					const isNamedAtLayer =
						parent.type === "Atrule" &&
						parent.name === "layer" &&
						parent.prelude;

					context.report({
						loc: node.loc,
						messageId: "emptyBlock",
						suggest: isNamedAtLayer
							? [
									{
										messageId: "convertToStatement",
										fix: fixer =>
											fixer.replaceText(node, ";"),
									},
								]
							: [
									{
										messageId: "removeRule",
										fix: fixer => fixer.remove(parent),
									},
								],
					});
				}
			},
		};
	},
});
