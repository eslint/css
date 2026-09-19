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
		languages: ["css/css"],

		hasSuggestions: true,

		docs: {
			description: "Disallow empty blocks",
			dialects: ["CSS"],
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
						parent.name.toLowerCase() === "layer" &&
						parent.prelude;

					context.report({
						loc: node.loc,
						messageId: "emptyBlock",
						suggest: isNamedAtLayer
							? [
									{
										messageId: "convertToStatement",
										fix(fixer) {
											const commentsBeforeBlock =
												context.sourceCode.comments.filter(
													comment =>
														comment.loc.start
															.offset >=
															parent.prelude.loc
																.end.offset &&
														comment.loc.end
															.offset <=
															node.loc.start
																.offset,
												);
											const lastComment =
												commentsBeforeBlock.at(-1);

											return fixer.replaceTextRange(
												[
													lastComment
														? lastComment.loc.end
																.offset
														: parent.prelude.loc.end
																.offset,
													node.loc.end.offset,
												],
												";",
											);
										},
									},
								]
							: [
									{
										messageId: "removeRule",
										fix(fixer) {
											return fixer.remove(parent);
										},
									},
								],
					});
				}
			},
		};
	},
});
