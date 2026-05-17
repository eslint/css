/**
 * @fileoverview Rule to prevent duplicate imports in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"duplicateImport" | "removeDuplicateImportWithConditions" | "removeDuplicateImportWithoutConditions"} NoDuplicateKeysMessageIds
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
 * Get the conditions of an import statement.
 * @param {Object} importNode The import node to get conditions from.
 * @param {Object} sourceCode The source code object.
 * @returns {string[]} An array of conditions for the import statement.
 */
function getImportConditions(importNode, sourceCode) {
	const importConditions = [];

	const importHasConditions = importNode.prelude.children.length > 1;

	if (importHasConditions) {
		importNode.prelude.children.slice(1).forEach(condition => {
			const conditionText = sourceCode.getText(condition).trim();
			importConditions.push(conditionText);
		});
	}

	return importConditions;
}

/**
 * Get the fix for a duplicate import statement.
 * @param {Object} fixer The fixer object.
 * @param {string} text The full text of the source code.
 * @param {number} start The start index of the import statement to fix.
 * @param {number} end The end index of the import statement to fix.
 * @param {boolean} condition A boolean indicating whether the import statement has conditions that differ from the original import.
 * @returns {Object|null} A fix object if a fix is applicable, or null if no fix should be applied.
 */
function getFixForImport(fixer, text, start, end, condition) {
	const removeEnd = getImportEnd(text, end);

	if (condition) {
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

		fixable: "code",
		hasSuggestions: true,

		docs: {
			description: "Disallow duplicate @import rules",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-imports.md",
		},

		messages: {
			duplicateImport: "Unexpected duplicate @import rule for '{{url}}'.",
			removeDuplicateImportWithConditions:
				"Remove duplicate @import rule with condition(s) - {{conditions}}.",
			removeDuplicateImportWithoutConditions:
				"Remove duplicate @import rule without conditions.",
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

					const firstImporthHasConditions =
						firstImportNode.prelude.children.length > 1;
					const nodeHasConditions = node.prelude.children.length > 1;

					const [start, end] = sourceCode.getRange(node);
					const text = sourceCode.text;

					const firstImportConditions = getImportConditions(
						firstImportNode,
						sourceCode,
					);
					const duplicateImportConditions = getImportConditions(
						node,
						sourceCode,
					);

					const hasSameConditions =
						firstImportConditions.length ===
							duplicateImportConditions.length &&
						firstImportConditions.every(
							(condition, index) =>
								condition === duplicateImportConditions[index],
						);

					context.report({
						loc: node.loc,
						messageId: "duplicateImport",
						data: { url },
						fix(fixer) {
							const condition =
								(!firstImporthHasConditions &&
									!nodeHasConditions) ||
								hasSameConditions;

							return getFixForImport(
								fixer,
								text,
								start,
								end,
								condition,
							);
						},
						suggest: [
							{
								messageId: firstImporthHasConditions
									? "removeDuplicateImportWithConditions"
									: "removeDuplicateImportWithoutConditions",
								data: {
									conditions: firstImportConditions.join(" "),
								},
								fix(fixer) {
									const condition =
										(firstImporthHasConditions ||
											nodeHasConditions) &&
										!hasSameConditions;

									return getFixForImport(
										fixer,
										text,
										firstImportStart,
										firstImportEnd,
										condition,
									);
								},
							},
							{
								messageId: nodeHasConditions
									? "removeDuplicateImportWithConditions"
									: "removeDuplicateImportWithoutConditions",
								data: {
									conditions:
										duplicateImportConditions.join(" "),
								},
								fix(fixer) {
									const condition =
										(firstImporthHasConditions ||
											nodeHasConditions) &&
										!hasSameConditions;

									return getFixForImport(
										fixer,
										text,
										start,
										end,
										condition,
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
