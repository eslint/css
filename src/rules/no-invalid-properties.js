/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { lexer } from "css-tree";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").SyntaxMatchError} SyntaxMatchError */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if an error is a syntax match error.
 * @param {Object} error The error object from the CSS parser.
 * @returns {error is SyntaxMatchError} True if the error is a syntax match error, false if not.
 */
function isSyntaxMatchError(error) {
	return typeof error.css === "string";
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid properties",
			recommended: true,
		},

		messages: {
			invalidPropertyValue:
				"Invalid value '{{value}}' for property '{{property}}'. Expected {{expected}}.",
			unknownProperty: "Unknown property '{{property}}' found.",
		},
	},

	create(context) {
		return {
			"Rule > Block > Declaration"(node) {
				// don't validate custom properties
				if (node.property.startsWith("--")) {
					return;
				}

				const { error } = lexer.matchDeclaration(node);

				if (error) {
					// validation failure
					if (isSyntaxMatchError(error)) {
						context.report({
							loc: error.loc,
							messageId: "invalidPropertyValue",
							data: {
								property: node.property,
								value: error.css,
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
