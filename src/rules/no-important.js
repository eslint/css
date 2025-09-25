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
						match => match.replace(/[^\n]/gu, " "),
					);
					const importantMatch =
						importantPattern.exec(textWithoutComments);
					const importantStartOffset =
						node.loc.start.offset + importantMatch.index;
					const importantEndOffset =
						importantStartOffset + importantMatch[0].length;

					context.report({
						loc: {
							start: sourceCode.getLocFromIndex(
								importantStartOffset,
							),
							end: sourceCode.getLocFromIndex(importantEndOffset),
						},
						messageId: "unexpectedImportant",
						suggest: [
							{
								messageId: "removeImportant",
								fix(fixer) {
									const importantStart = importantMatch.index;

									// Find any trailing whitespace before the !important
									const valuePart = declarationText.slice(
										0,
										importantStart,
									);
									const whitespaceEnd = valuePart.search(
										trailingWhitespacePattern,
									);

									const start =
										node.loc.start.offset + whitespaceEnd;

									return fixer.removeRange([
										start,
										importantEndOffset,
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
