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
 * @typedef {"unexpectedImportant" | "removeImportant"} NoImportantMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoImportantMessageIds }>} NoImportantRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const importantPattern = /!(\s|\/\*.*?\*\/)*important/iu;

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
		return {
			Declaration(node) {
				if (node.important) {
					const declarationText = context.sourceCode.getText(node);
					const importantMatch =
						importantPattern.exec(declarationText);

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
						suggest: [
							{
								messageId: "removeImportant",
								fix(fixer) {
									const start =
										node.loc.start.offset +
										importantMatch.index;
									const end =
										start + importantMatch[0].length;
									return fixer.removeRange([start, end]);
								},
							},
						],
					});
				}
			},
		};
	},
};
