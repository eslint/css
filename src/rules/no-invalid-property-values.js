/**
 * @fileoverview Rule to prevent the use of properties with invalid values in CSS.
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
			description: "Disallow properties with invalid values.",
			recommended: true,
		},

		messages: {
			invalidPropertyValue:
				"Invalid value '{{value}}' for property '{{property}}'. Expected {{expected}}.",
		},
	},

	create(context) {
		return {
			Declaration(node) {
				// don't validate custom properties
				if (node.property.startsWith("--")) {
					return;
				}

				const { error } = lexer.matchDeclaration(node);

				/*
				 * If the property is unknown, then `error` does not
				 * contain a `loc` property. In that case, we don't
				 * need to report anything because that error is handled
				 * by the `no-unknown-properties` rule.
				 */
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
				}
			},
		};
	},
};
