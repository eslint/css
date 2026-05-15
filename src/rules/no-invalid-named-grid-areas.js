/**
 * @fileoverview Rule to prevent invalid named grid areas in CSS grid templates.
 * @author xbinaryx
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"emptyGridArea" | "unevenGridArea" | "nonRectangularGridArea"} NoInvalidNamedGridAreasMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidNamedGridAreasMessageIds }>} NoInvalidNamedGridAreasRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Regular expression to match null cell tokens (sequences of one or more dots)
 */
const nullCellToken = /^\.+$/u;

/**
 * Finds non-rectangular grid areas in a 2D grid
 * @param {string[][]} grid 2D array representing the grid areas
 * @returns {Array<{name: string, row: number}>} Array of errors found
 */
function findNonRectangularAreas(grid) {
	const errors = [];
	const reported = new Set();
	const names = [...new Set(grid.flat())].filter(
		name => !nullCellToken.test(name),
	);

	for (const name of names) {
		const indicesByRow = grid.map(row => {
			const indices = [];
			let idx = row.indexOf(name);

			while (idx !== -1) {
				indices.push(idx);
				idx = row.indexOf(name, idx + 1);
			}

			return indices;
		});

		for (let i = 0; i < indicesByRow.length; i++) {
			for (let j = i + 1; j < indicesByRow.length; j++) {
				const row1 = indicesByRow[i];
				const row2 = indicesByRow[j];

				if (row1.length === 0 || row2.length === 0) {
					continue;
				}

				if (
					row1.length !== row2.length ||
					!row1.every((val, idx) => val === row2[idx])
				) {
					const key = `${name}|${j}`;
					if (!reported.has(key)) {
						errors.push({ name, row: j });
						reported.add(key);
					}
				}
			}
		}
	}

	return errors;
}

const validProps = new Set(["grid-template-areas", "grid-template", "grid"]);

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoInvalidNamedGridAreasRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid named grid areas",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-named-grid-areas.md",
		},

		messages: {
			emptyGridArea: "Grid area must contain at least one cell token.",
			unevenGridArea:
				"Grid area strings must have the same number of cell tokens.",
			nonRectangularGridArea:
				"Cell tokens with name '{{name}}' must form a rectangle.",
		},
	},

	create(context) {
		return {
			Declaration(node) {
				const propName = node.property.toLowerCase();

				if (
					validProps.has(propName) &&
					node.value.type === "Value" &&
					node.value.children.length > 0
				) {
					const stringNodes = node.value.children.filter(
						child => child.type === "String",
					);

					if (stringNodes.length === 0) {
						return;
					}

					const grid = [];
					const emptyNodes = [];
					const unevenNodes = [];
					let firstRowLen = null;

					for (const stringNode of stringNodes) {
						const trimmedValue = stringNode.value.trim();

						if (trimmedValue === "") {
							emptyNodes.push(stringNode);
							continue;
						}

						const row = trimmedValue.split(" ").filter(Boolean);
						grid.push(row);

						if (firstRowLen === null) {
							firstRowLen = row.length;
						} else if (row.length !== firstRowLen) {
							unevenNodes.push(stringNode);
						}
					}

					if (emptyNodes.length > 0) {
						emptyNodes.forEach(emptyNode =>
							context.report({
								node: emptyNode,
								messageId: "emptyGridArea",
							}),
						);
						return;
					}

					if (unevenNodes.length > 0) {
						unevenNodes.forEach(unevenNode =>
							context.report({
								node: unevenNode,
								messageId: "unevenGridArea",
							}),
						);
						return;
					}

					const nonRectErrors = findNonRectangularAreas(grid);
					nonRectErrors.forEach(({ name, row }) => {
						const stringNode = stringNodes[row];
						context.report({
							node: stringNode,
							messageId: "nonRectangularGridArea",
							data: {
								name,
							},
						});
					});
				}
			},
		};
	},
};
