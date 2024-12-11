/**
 * @fileoverview Rule to prevent the use of unknown at-rules in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { lexer } from "css-tree";
import { isSyntaxMatchError } from "../util.js";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Extracts metadata from an error object.
 * @param {SyntaxError} error The error object to extract metadata from.
 * @returns {Object} The metadata extracted from the error.
 */
function extractMetaDataFromError(error) {
	const message = error.message;
	const atRuleName = /`@(.*)`/u.exec(message)[1];
	let messageId = "unknownAtRule";

	if (message.endsWith("prelude")) {
		messageId = message.includes("should not")
			? "invalidExtraPrelude"
			: "missingPrelude";
	}

	return {
		messageId,
		data: {
			name: atRuleName,
		},
	};
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Disallow invalid at-rules",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-at-rules.md",
		},

		messages: {
			unknownAtRule: "Unknown at-rule '@{{name}}' found.",
			invalidPrelude:
				"Invalid prelude '{{prelude}}' found for at-rule '@{{name}}'. Expected '{{expected}}'.",
			unknownDescriptor:
				"Unknown descriptor '{{descriptor}}' found for at-rule '@{{name}}'.",
			invalidDescriptor:
				"Invalid value '{{value}}' for descriptor '{{descriptor}}' found for at-rule '@{{name}}'. Expected {{expected}}.",
			invalidExtraPrelude:
				"At-rule '@{{name}}' should not contain a prelude.",
			missingPrelude: "At-rule '@{{name}}' should contain a prelude.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			Atrule(node) {
				// checks both name and prelude
				const { error } = lexer.matchAtrulePrelude(
					node.name,
					node.prelude,
				);

				if (error) {
					if (isSyntaxMatchError(error)) {
						context.report({
							loc: error.loc,
							messageId: "invalidPrelude",
							data: {
								name: node.name,
								prelude: error.css,
								expected: error.syntax,
							},
						});
						return;
					}

					const loc = node.loc;

					context.report({
						loc: {
							start: loc.start,
							end: {
								line: loc.start.line,

								// add 1 to account for the @ symbol
								column: loc.start.column + node.name.length + 1,
							},
						},
						...extractMetaDataFromError(error),
					});
				}
			},

			"AtRule > Block > Declaration"(node) {
				// get at rule node
				const atRule = sourceCode.getParent(sourceCode.getParent(node));

				const { error } = lexer.matchAtruleDescriptor(
					atRule.name,
					node.property,
					node.value,
				);

				if (error) {
					if (isSyntaxMatchError(error)) {
						context.report({
							loc: error.loc,
							messageId: "invalidDescriptor",
							data: {
								name: atRule.name,
								descriptor: node.property,
								value: error.css,
								expected: error.syntax,
							},
						});
						return;
					}

					const loc = node.loc;

					context.report({
						loc: {
							start: loc.start,
							end: {
								line: loc.start.line,
								column: loc.start.column + node.property.length,
							},
						},
						messageId: "unknownDescriptor",
						data: {
							name: atRule.name,
							descriptor: node.property,
						},
					});
				}
			},
		};
	},
};
