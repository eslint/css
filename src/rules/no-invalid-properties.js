/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { isSyntaxMatchError } from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CSSSourceCode } from "../languages/css-source-code.js"
 * @import { ValuePlain, FunctionNodePlain, CssLocationRange, Identifier } from "@eslint/css-tree"
 * @typedef {"invalidPropertyValue" | "unknownProperty" | "unknownVar"} NoInvalidPropertiesMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidPropertiesMessageIds }>} NoInvalidPropertiesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Given a value node, replaces any var() references with their corresponding values
 * from the provided functions and returns the updated value along with a map
 * of offsets where the replacements occurred to the functions' locations, plus
 * an array of variable names whose value could not be determined.
 * @param {ValuePlain} valueNode The value node to process.
 * @param {Array<FunctionNodePlain>} funcs The var() functions in the value.
 * @param {CSSSourceCode} sourceCode The source code object to get variable values from.
 * @returns {{text: string, offsets: Map<number,CssLocationRange>, unknownVars: Array<string>}}
 */
function replaceVariablesInValue(valueNode, funcs, sourceCode) {
	/**
	 * The funcs array is already sorted by start offset.
	 */
	if (!funcs || funcs.length === 0) {
		const value = sourceCode.getText(valueNode);
		return { text: value, offsets: new Map(), unknownVars: [] };
	}

	const offsets = new Map();
	const unknownVars = [];
	const valueText = sourceCode.getText(valueNode);

	// Calculate the starting position of the value node in the document
	const valueStartOffset = valueNode.loc.start.offset;

	// Process functions in forward order and track offset adjustments
	let modifiedValue = valueText;
	let offsetAdjustment = 0;

	for (const func of funcs) {
		// Extract the variable name from the function node
		const varName = /** @type {Identifier} */ (func.children[0]).name;

		// Pass the full var() function node to getVariableValue
		const replacement = sourceCode.getVariableValue(func);

		if (!replacement) {
			unknownVars.push(varName);
			continue;
		}

		const replacementText = sourceCode.getText(replacement).trim();

		// Calculate the relative position of the function within the original value
		const funcStart = func.loc.start.offset;
		const funcEnd = func.loc.end.offset;
		const relativeStart = funcStart - valueStartOffset;
		const relativeEnd = funcEnd - valueStartOffset;

		// Adjust for previous replacements
		const adjustedRelativeStart = relativeStart + offsetAdjustment;
		const adjustedRelativeEnd = relativeEnd + offsetAdjustment;

		// Ensure the function is actually within the value bounds
		if (relativeStart >= 0 && relativeEnd <= valueText.length) {
			// Replace the function text with the replacement text
			const before = modifiedValue.slice(0, adjustedRelativeStart);
			const after = modifiedValue.slice(adjustedRelativeEnd);

			modifiedValue = before + replacementText + after;
			offsets.set(adjustedRelativeStart, func.loc);

			// Update offset adjustment for subsequent replacements
			const originalLength = funcEnd - funcStart;
			const newLength = replacementText.length;
			offsetAdjustment += newLength - originalLength;
		}
	}

	return { text: modifiedValue, offsets, unknownVars };
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {NoInvalidPropertiesRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid properties",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-properties.md",
		},

		messages: {
			invalidPropertyValue:
				"Invalid value '{{value}}' for property '{{property}}'. Expected {{expected}}.",
			unknownProperty: "Unknown property '{{property}}' found.",
			unknownVar: "Can't validate with unknown variable '{{var}}'.",
		},
	},

	create(context) {
		const sourceCode = context.sourceCode;
		const lexer = sourceCode.lexer;

		return {
			"Rule > Block > Declaration:exit"(node) {
				// don't validate custom properties
				if (node.property.startsWith("--")) {
					return;
				}

				const varsFound = sourceCode.getDeclarationVariables(node);

				/** @type {Map<number,CssLocationRange>} */
				const varsFoundLocs = new Map();
				const usingVars = varsFound.length > 0;
				let value = node.value;

				if (usingVars) {
					const { text, offsets, unknownVars } =
						replaceVariablesInValue(
							node.value,
							varsFound,
							sourceCode,
						);

					value = text;

					/*
					 * Store the offsets of the replacements so we can
					 * report the correct location of any validation error.
					 */
					offsets.forEach((loc, offset) => {
						varsFoundLocs.set(offset, loc);
					});

					// report all unknown variables and return early if any exist
					if (unknownVars.length > 0) {
						unknownVars.forEach(varName => {
							// Find the corresponding function node for this variable
							const funcNode = varsFound.find(func => {
								const name = /** @type {Identifier} */ (
									func.children[0]
								).name;
								return name === varName;
							});

							context.report({
								loc: funcNode
									? funcNode.children[0].loc
									: node.value.loc,
								messageId: "unknownVar",
								data: {
									var: varName,
								},
							});
						});
						return; // Don't validate further if variables can't be resolved
					}
				}

				const { error } = lexer.matchProperty(node.property, value);

				if (error) {
					// validation failure
					if (isSyntaxMatchError(error)) {
						context.report({
							/*
							 * When using variables, check to see if the error
							 * occurred at a location where a variable was replaced.
							 * If so, use that location; otherwise, use the error's
							 * reported location.
							 */
							loc: usingVars
								? (varsFoundLocs.get(error.mismatchOffset) ??
									node.value.loc)
								: error.loc,
							messageId: "invalidPropertyValue",
							data: {
								property: node.property,

								/*
								 * When using variables, slice the value to
								 * only include the part that caused the error.
								 * Otherwise, use the full value from the error.
								 */
								value: usingVars
									? value.slice(
											error.mismatchOffset,
											error.mismatchOffset +
												error.mismatchLength,
										)
									: error.css,
								expected: error.syntax,
							},
						});
						return;
					}

					// unknown property
					context.report({
						loc: {
							start: node.loc.start,
							end: {
								line: node.loc.start.line,
								column:
									node.loc.start.column +
									node.property.length,
							},
						},
						messageId: "unknownProperty",
						data: {
							property: node.property,
						},
					});
				}
			},
		};
	},
};
