/**
 * @fileoverview Rule to prevent empty blocks in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SuggestedEdit } from "@eslint/core"
 * @import { BlockPlain } from "@eslint/css-tree"
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CSSSourceCode } from "../languages/css-source-code.js"
 * @typedef {"emptyBlock" | "removeRule" | "convertToStatement" | "addComment"} NoEmptyBlocksMessageIds
 * @typedef {[{reportCommentOnlyBlocks?: boolean}]} NoEmptyBlocksOptions
 * @typedef {CSSRuleDefinition<{ RuleOptions: NoEmptyBlocksOptions, MessageIds: NoEmptyBlocksMessageIds }>} NoEmptyBlocksRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if a block contains a comment.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @param {BlockPlain} block The block to check.
 * @returns {boolean} `true` if the block contains a comment, `false` otherwise.
 */
function containsComment(sourceCode, block) {
	return sourceCode.comments.some(
		comment =>
			comment.loc.start.offset >= block.loc.start.offset &&
			comment.loc.end.offset <= block.loc.end.offset,
	);
}

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

		schema: [
			{
				type: "object",
				properties: {
					reportCommentOnlyBlocks: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				reportCommentOnlyBlocks: false,
			},
		],

		messages: {
			emptyBlock: "Unexpected empty block found.",
			removeRule: "Remove the empty rule.",
			convertToStatement: "Convert to layer statement.",
			addComment: "Add a comment inside the empty block.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		const [{ reportCommentOnlyBlocks }] = context.options;

		return {
			Block(node) {
				if (
					node.children.length === 0 &&
					(reportCommentOnlyBlocks ||
						!containsComment(sourceCode, node))
				) {
					const parent = sourceCode.getParent(node);
					const isNamedAtLayer =
						parent.type === "Atrule" &&
						parent.name.toLowerCase() === "layer" &&
						parent.prelude;

					/** @type {Array<SuggestedEdit<NoEmptyBlocksMessageIds>>} */
					const suggest = [
						isNamedAtLayer
							? {
									messageId: "convertToStatement",
									fix(fixer) {
										const commentsBeforeBlock =
											sourceCode.comments.filter(
												comment =>
													comment.loc.start.offset >=
														parent.prelude.loc.end
															.offset &&
													comment.loc.end.offset <=
														node.loc.start.offset,
											);
										const lastComment =
											commentsBeforeBlock.at(-1);

										return fixer.replaceTextRange(
											[
												lastComment
													? lastComment.loc.end.offset
													: parent.prelude.loc.end
															.offset,
												node.loc.end.offset,
											],
											";",
										);
									},
								}
							: {
									messageId: "removeRule",
									fix(fixer) {
										return fixer.remove(parent);
									},
								},
					];

					if (!reportCommentOnlyBlocks) {
						suggest.push({
							messageId: "addComment",
							fix(fixer) {
								return fixer.replaceText(
									node,
									"{ /* empty */ }",
								);
							},
						});
					}

					context.report({
						loc: node.loc,
						messageId: "emptyBlock",
						suggest,
					});
				}
			},
		};
	},
});
