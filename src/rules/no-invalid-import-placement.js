/**
 * @fileoverview Rule to enforce correct placement of `@import` rules in CSS.
 * @author thecalamiity
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"invalidImportPlacement"} NoInvalidImportPlacementMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidImportPlacementMessageIds }>} NoInvalidImportPlacementRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const IGNORED_AT_RULES = new Set(["charset", "layer"]);

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoInvalidImportPlacementRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid placement of @import rules",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-import-placement.md",
		},

		messages: {
			invalidImportPlacement:
				"@import must come before other rules (except @charset and @layer).",
		},
	},

	create(context) {
		let hasSeenNonImportRule = false;

		return {
			Atrule(node) {
				const name = node.name.toLowerCase();

				if (IGNORED_AT_RULES.has(name)) {
					return;
				}

				if (name === "import") {
					if (hasSeenNonImportRule) {
						context.report({
							node,
							messageId: "invalidImportPlacement",
						});
					}
				} else {
					hasSeenNonImportRule = true;
				}
			},

			Rule() {
				hasSeenNonImportRule = true;
			},
		};
	},
};
