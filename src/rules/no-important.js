/**
 * @fileoverview Rule to disallow `!important` flags.
 * @author thecalamiity
 * @author Yann Bertrand
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { findOffsets } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"unexpectedImportant"} NoImportantMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoImportantMessageIds }>} NoImportantRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const importantPattern = /!\s*important/iu;
const commentPattern = /\/\*[\s\S]*?\*\//gu;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoImportantRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow !important flags",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-important.md",
		},

		messages: {
			unexpectedImportant: "Unexpected !important flag found.",
		},
	},

	create(context) {
		return {
			Declaration(node) {
				if (node.important) {
					const declarationText = context.sourceCode.getText(node);
					const textWithoutComments = declarationText.replace(
						commentPattern,
						match => match.replace(/[^\n]/gu, " "),
					);
					const importantMatch =
						importantPattern.exec(textWithoutComments);

					const {
						lineOffset: startLineOffset,
						columnOffset: startColumnOffset,
					} = findOffsets(declarationText, importantMatch.index);

					const {
						lineOffset: endLineOffset,
						columnOffset: endColumnOffset,
					} = findOffsets(
						declarationText,
						importantMatch.index + importantMatch[0].length,
					);

					const nodeStartLine = node.loc.start.line;
					const nodeStartColumn = node.loc.start.column;
					const startLine = nodeStartLine + startLineOffset;
					const endLine = nodeStartLine + endLineOffset;
					const startColumn =
						(startLine === nodeStartLine ? nodeStartColumn : 1) +
						startColumnOffset;
					const endColumn =
						(endLine === nodeStartLine ? nodeStartColumn : 1) +
						endColumnOffset;

					context.report({
						loc: {
							start: {
								line: startLine,
								column: startColumn,
							},
							end: {
								line: endLine,
								column: endColumn,
							},
						},
						messageId: "unexpectedImportant",
					});
				}
			},
		};
	},
};
