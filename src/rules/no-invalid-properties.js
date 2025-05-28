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
 * @import { ValuePlain, FunctionNodePlain, CssLocationRange } from "@eslint/css-tree";
 * @typedef {"invalidPropertyValue" | "unknownProperty" | "unknownVar"} NoInvalidPropertiesMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidPropertiesMessageIds }>} NoInvalidPropertiesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Replaces all instances of a regex pattern with a replacement and tracks the offsets
 * @param {string} text The text to perform replacements on
 * @param {string} varName The regex pattern string to search for
 * @param {string} replaceValue The string to replace with
 * @returns {{text: string, offsets: Array<number>}} The updated text and array of offsets
 * where replacements occurred
 */
function replaceWithOffsets(text, varName, replaceValue) {
	const offsets = [];
	let result = "";
	let lastIndex = 0;

	const regex = new RegExp(`var\\(\\s*${varName}\\s*\\)`, "gu");
	let match;

	while ((match = regex.exec(text)) !== null) {
		result += text.slice(lastIndex, match.index);
		result += replaceValue;
		offsets.push(match.index);
		lastIndex = match.index + match[0].length;
	}

	result += text.slice(lastIndex);
	return { text: result, offsets };
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

		/** @type {Map<string,ValuePlain>} */
		const vars = new Map();

		/** @type {Array<Map<string,FunctionNodePlain>>} */
		const replacements = [];

		return {
			"Rule > Block > Declaration"() {
				replacements.push(new Map());
			},

			"Function[name=var]"(node) {
				const map = replacements.at(-1);
				if (!map) {
					return;
				}

				/*
				 * Store the custom property name and the function node
				 * so can use these to validate the value later.
				 */
				const name = node.children[0].name;
				map.set(name, node);
			},

			"Rule > Block > Declaration:exit"(node) {
				if (node.property.startsWith("--")) {
					// store the custom property name and value to validate later
					vars.set(node.property, node.value);

					// don't validate custom properties
					return;
				}

				const varsFound = replacements.pop();

				/** @type {Map<number,CssLocationRange>} */
				const varsFoundLocs = new Map();
				const usingVars = varsFound?.size > 0;
				let value = node.value;

				if (usingVars) {
					// need to use a text version of the value here
					value = sourceCode.getText(node.value);
					let offsets;

					// replace any custom properties with their values
					for (const [name, func] of varsFound) {
						const varValue = vars.get(name);

						if (varValue) {
							({ text: value, offsets } = replaceWithOffsets(
								value,
								name,
								sourceCode.getText(varValue).trim(),
							));

							/*
							 * Store the offsets of the replacements so we can
							 * report the correct location of any validation error.
							 */
							offsets.forEach(offset => {
								varsFoundLocs.set(offset, func.loc);
							});
						} else {
							context.report({
								loc: func.children[0].loc,
								messageId: "unknownVar",
								data: {
									var: name,
								},
							});

							return;
						}
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
