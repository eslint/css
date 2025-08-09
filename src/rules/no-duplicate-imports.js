/**
 * @fileoverview Rule to prevent duplicate imports in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"duplicateImport"} NoDuplicateKeysMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoDuplicateKeysMessageIds }>} NoDuplicateImportsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule
//-----------------------------------------------------------------------------

/**
 * @type {NoDuplicateImportsRuleDefinition}
 */
export default {
	meta: {
		type: "problem",

		fixable: "code",

		docs: {
			description: "Disallow duplicate @import rules",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-imports.md",
		},

		messages: {
			duplicateImport: "Unexpected duplicate @import rule for {{url}}.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		const imports = new Set();

		return {
			"Atrule[name=/^import$/i]"(node) {
				const url = node.prelude.children[0].value;

				if (imports.has(url)) {
					context.report({
						loc: node.loc,
						messageId: "duplicateImport",
						data: { url },
						fix(fixer) {
							const [start, end] = sourceCode.getRange(node);
							// Remove the node, and also remove a following newline if present
							const removeEnd =
								sourceCode.text[end] === "\n" ? end + 1 : end;
							return fixer.removeRange([start, removeEnd]);
						},
					});
				} else {
					imports.add(url);
				}
			},
		};
	},
};
