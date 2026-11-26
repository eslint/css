/**
 * @fileoverview Rule to prevent duplicate imports in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SourceRange, SuggestedEdit } from "@eslint/core"
 * @import { AtrulePlain } from "@eslint/css-tree"
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CSSSourceCode } from "../languages/css-source-code.js"
 * @typedef {"duplicateImport" | "removeDuplicateImportWithModifiers" | "removeDuplicateImportWithoutModifiers"} NoDuplicateImportsMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoDuplicateImportsMessageIds }>} NoDuplicateImportsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const leadingDotSlashPattern = /^(?:\.\/)+/u;

/**
 * Get the range of an import statement including a following newline if present.
 * @param {AtrulePlain} importNode The import node to get the range of.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @returns {SourceRange} The range of the import statement including a following newline.
 */
function getImportRange(importNode, sourceCode) {
	const { text } = sourceCode;
	const [start, end] = sourceCode.getRange(importNode);
	let removeEnd = end;

	// Remove the node, and also remove a following newline if present
	if (text[removeEnd] === "\r") {
		removeEnd += text[removeEnd + 1] === "\n" ? 2 : 1;
	} else if (text[removeEnd] === "\n" || text[removeEnd] === "\f") {
		removeEnd += 1;
	}

	return [start, removeEnd];
}

/**
 * Get the modifiers of an import statement.
 * @param {AtrulePlain} importNode The import node to get modifiers from.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @returns {string} The modifiers of the import statement separated by spaces, or an empty string if it has none.
 */
function getImportModifiers(importNode, sourceCode) {
	if (importNode.prelude?.type !== "AtrulePrelude") {
		return "";
	}

	return importNode.prelude.children
		.slice(1)
		.map(modifier => sourceCode.getText(modifier).trim())
		.join(" ");
}

/**
 * Get a suggestion to remove an import statement.
 * @param {AtrulePlain} importNode The import node to remove.
 * @param {string} modifiers The modifiers of the import statement.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @returns {SuggestedEdit<NoDuplicateImportsMessageIds>} The suggestion to remove the import statement.
 */
function getRemoveImportSuggestion(importNode, modifiers, sourceCode) {
	return {
		messageId: modifiers
			? "removeDuplicateImportWithModifiers"
			: "removeDuplicateImportWithoutModifiers",
		data: { modifiers },
		fix(fixer) {
			return fixer.removeRange(getImportRange(importNode, sourceCode));
		},
	};
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoDuplicateImportsRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		fixable: "code",
		hasSuggestions: true,

		docs: {
			description: "Disallow duplicate @import rules",
			dialects: ["CSS"],
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-imports.md",
		},

		messages: {
			duplicateImport: "Unexpected duplicate @import rule for '{{url}}'.",
			removeDuplicateImportWithModifiers:
				"Remove duplicate @import rule with modifier(s) - {{modifiers}}.",
			removeDuplicateImportWithoutModifiers:
				"Remove duplicate @import rule without modifiers.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		/** @type {Map<string, AtrulePlain>} */
		const imports = new Map();

		return {
			"Atrule[name=/^import$/i]"(node) {
				const url = node.prelude?.children[0].value;
				const normalizedUrl = url?.replace(leadingDotSlashPattern, "");
				const firstImportNode = imports.get(normalizedUrl);

				if (!firstImportNode) {
					imports.set(normalizedUrl, node);
					return;
				}

				const firstImportModifiers = getImportModifiers(
					firstImportNode,
					sourceCode,
				);
				const duplicateImportModifiers = getImportModifiers(
					node,
					sourceCode,
				);
				const hasSameModifiers =
					firstImportModifiers === duplicateImportModifiers;

				context.report({
					loc: node.loc,
					messageId: "duplicateImport",
					data: { url },
					fix(fixer) {
						if (!hasSameModifiers) {
							return null;
						}

						return fixer.removeRange(
							getImportRange(node, sourceCode),
						);
					},
					suggest: hasSameModifiers
						? null
						: [
								getRemoveImportSuggestion(
									firstImportNode,
									firstImportModifiers,
									sourceCode,
								),
								getRemoveImportSuggestion(
									node,
									duplicateImportModifiers,
									sourceCode,
								),
							],
				});
			},
		};
	},
});
