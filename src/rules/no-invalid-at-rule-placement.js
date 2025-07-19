/**
 * @fileoverview Rule to enforce correct placement of at-rules.
 * @author thecalamiity
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"invalidCharsetPlacement" | "invalidImportPlacement" | "invalidNamespacePlacement"} NoInvalidAtRulePlacementMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidAtRulePlacementMessageIds }>} NoInvalidAtRulePlacementRuleDefinition
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoInvalidAtRulePlacementRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid placement of at-rules",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-at-rule-placement.md",
		},

		messages: {
			invalidCharsetPlacement:
				"@charset must be placed at the very beginning of the stylesheet, before any rules, comments, or whitespace.",
			invalidImportPlacement:
				"@import must be placed before all other rules, except @charset and @layer statements.",
			invalidNamespacePlacement:
				"@namespace must be placed before all other rules, except @charset and @import.",
		},
	},

	create(context) {
		let hasSeenNonImportRule = false;
		let hasSeenLayerBlock = false;
		let hasSeenLayer = false;
		let hasSeenNamespace = false;

		return {
			Atrule(node) {
				const name = node.name.toLowerCase();

				if (name === "charset") {
					if (
						node.loc.start.line !== 1 ||
						node.loc.start.column !== 1
					) {
						context.report({
							node,
							messageId: "invalidCharsetPlacement",
						});
					}
					return;
				}

				if (name === "layer") {
					if (node.block) {
						hasSeenLayerBlock = true;
					}
					hasSeenLayer = true;
					return;
				}

				if (name === "namespace") {
					if (hasSeenNonImportRule || hasSeenLayer) {
						context.report({
							node,
							messageId: "invalidNamespacePlacement",
						});
					}
					hasSeenNamespace = true;
					return;
				}

				if (name === "import") {
					if (
						hasSeenNonImportRule ||
						hasSeenNamespace ||
						hasSeenLayerBlock
					) {
						context.report({
							node,
							messageId: "invalidImportPlacement",
						});
					}
					return;
				}

				hasSeenNonImportRule = true;
			},

			Rule() {
				hasSeenNonImportRule = true;
			},
		};
	},
};
