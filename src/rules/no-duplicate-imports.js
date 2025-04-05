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
		const imports = new Set();

		return {
			"Atrule[name=import]"(node) {
				const url = node.prelude.children[0].value;

				if (imports.has(url)) {
					context.report({
						loc: node.loc,
						messageId: "duplicateImport",
						data: { url },
					});
				} else {
					imports.add(url);
				}
			},
		};
	},
};
