/**
 * @fileoverview Rule to disallow `!important` flags.
 * @author thecalamiity
 * @author Yann Bertrand
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"unexpectedImportant" | "removeImportant"} NoImportantMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoImportantMessageIds }>} NoImportantRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const importantPattern = /!\s*important/iu;
const commentPattern = /\/\*[\s\S]*?\*\//gu;
const trailingWhitespacePattern = /\s*$/u;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoImportantRuleDefinition} */
export default {
	meta: {
		type: "problem",

		hasSuggestions: true,

		docs: {
			description: "Disallow !important flags",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-important.md",
		},

		messages: {
			unexpectedImportant: "Unexpected !important flag found.",
			removeImportant: "Remove !important flag.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			Declaration(node) {
				if (node.important) {
					const declarationText = sourceCode.getText(node);
					const textWithoutComments = declarationText.replace(
						commentPattern,
						/* eslint-disable-next-line require-unicode-regexp -- we want to replace each code unit with a space */
						match => match.replace(/[^\r\n\f]/g, " "),
					);
					const importantMatch =
						importantPattern.exec(textWithoutComments);
					const importantStartOffset = importantMatch.index;
					const importantEndOffset =
						importantStartOffset + importantMatch[0].length;
					const nodeStartOffset = node.loc.start.offset;

					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(
								nodeStartOffset + importantStartOffset,
							),
							end: sourceCode.getLocFromIndex(
								nodeStartOffset + importantEndOffset,
							),
						},
						messageId: "unexpectedImportant",
						suggest: [
							{
								messageId: "removeImportant",
								fix(fixer) {
									// Find any trailing whitespace before the `!important`
									const whitespaceEndOffset = declarationText
										.slice(0, importantStartOffset)
										.search(trailingWhitespacePattern);

									return fixer.removeRange([
										nodeStartOffset + whitespaceEndOffset,
										nodeStartOffset + importantEndOffset,
									]);
								},
							},
						],
					});
				}
			},
		};
	},
};
