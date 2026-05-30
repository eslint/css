/**
 * @fileoverview Rule to prevent duplicate imports in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"duplicateImport" | "removeDuplicateImportWithModifiers" | "removeDuplicateImportWithoutModifiers"} NoDuplicateKeysMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoDuplicateKeysMessageIds }>} NoDuplicateImportsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Get the end index of import statement including a following newline if present.
 * @param {string} text The full text of the source code.
 * @param {number} end The end index of the import statement.
 * @returns {number} The end index of the import statement including a following newline.
 */
function getImportEnd(text, end) {
	let removeEnd = end;

	// Remove the node, and also remove a following newline if present
	if (text[removeEnd] === "\r") {
		removeEnd += text[removeEnd + 1] === "\n" ? 2 : 1;
	} else if (text[removeEnd] === "\n" || text[removeEnd] === "\f") {
		removeEnd += 1;
	}

	return removeEnd;
}

/**
 * Get the modifiers of an import statement.
 * @param {Object} importNode The import node to get modifiers from.
 * @param {Object} sourceCode The source code object.
 * @returns {string[]} An array of modifiers for the import statement.
 */
function getImportModifiers(importNode, sourceCode) {
	const importModifiers = [];

	const importHasModifiers = importNode.prelude.children.length > 1;

	if (importHasModifiers) {
		importNode.prelude.children.slice(1).forEach(modifier => {
			const modifierText = sourceCode.getText(modifier).trim();
			importModifiers.push(modifierText);
		});
	}

	return importModifiers;
}

/**
 * Get the fix for a duplicate import statement.
 * @param {Object} fixer The fixer object.
 * @param {string} text The full text of the source code.
 * @param {number} start The start index of the import statement to fix.
 * @param {number} end The end index of the import statement to fix.
 * @param {boolean} hasModifiers A boolean indicating whether the import statement has modifiers that differ from the original import.
 * @returns {Object|null} A fix object if a fix is applicable, or null if no fix should be applied.
 */
function getFixForImport(fixer, text, start, end, hasModifiers) {
	const removeEnd = getImportEnd(text, end);

	if (hasModifiers) {
		return fixer.removeRange([start, removeEnd]);
	}

	return null;
}

//-----------------------------------------------------------------------------
// Rule
//-----------------------------------------------------------------------------

/**
 * @type {NoDuplicateImportsRuleDefinition}
 */
export default {
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
		const imports = [];

		return {
			"Atrule[name=/^import$/i]"(node) {
				const url = node.prelude.children[0].value;
				const hasImport = imports.some(
					importNode => importNode.prelude.children[0].value === url,
				);

				if (hasImport) {
					const firstImportNode = imports.find(
						importNode =>
							importNode.prelude.children[0].value === url,
					);
					const [firstImportStart, firstImportEnd] =
						sourceCode.getRange(firstImportNode);

					const firstImportHasModifiers =
						firstImportNode.prelude.children.length > 1;
					const nodeHasModifiers = node.prelude.children.length > 1;

					const [start, end] = sourceCode.getRange(node);
					const text = sourceCode.text;

					const firstImportModifiers = getImportModifiers(
						firstImportNode,
						sourceCode,
					);
					const duplicateImportModifiers = getImportModifiers(
						node,
						sourceCode,
					);

					const hasSameModifiers =
						firstImportModifiers.length ===
							duplicateImportModifiers.length &&
						firstImportModifiers.every(
							(modifier, index) =>
								modifier === duplicateImportModifiers[index],
						);

					context.report({
						loc: node.loc,
						messageId: "duplicateImport",
						data: { url },
						fix(fixer) {
							const hasModifiers =
								(!firstImportHasModifiers &&
									!nodeHasModifiers) ||
								hasSameModifiers;

							return getFixForImport(
								fixer,
								text,
								start,
								end,
								hasModifiers,
							);
						},
						suggest: [
							{
								messageId: firstImportHasModifiers
									? "removeDuplicateImportWithModifiers"
									: "removeDuplicateImportWithoutModifiers",
								data: {
									modifiers: firstImportModifiers.join(" "),
								},
								fix(fixer) {
									const hasModifiers =
										(firstImportHasModifiers ||
											nodeHasModifiers) &&
										!hasSameModifiers;

									return getFixForImport(
										fixer,
										text,
										firstImportStart,
										firstImportEnd,
										hasModifiers,
									);
								},
							},
							{
								messageId: nodeHasModifiers
									? "removeDuplicateImportWithModifiers"
									: "removeDuplicateImportWithoutModifiers",
								data: {
									modifiers:
										duplicateImportModifiers.join(" "),
								},
								fix(fixer) {
									const hasModifiers =
										(firstImportHasModifiers ||
											nodeHasModifiers) &&
										!hasSameModifiers;

									return getFixForImport(
										fixer,
										text,
										start,
										end,
										hasModifiers,
									);
								},
							},
						],
					});
				} else {
					imports.push(node);
				}
			},
		};
	},
};
