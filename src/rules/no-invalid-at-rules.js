/**
 * @fileoverview Rule to prevent the use of unknown at-rules in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { lexer } from "css-tree";

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid at-rules.",
			recommended: true,
		},

		messages: {
			unknownAtRule: "Unknown at-rule '@{{name}}' found.",
			invalidPrelude:
				"Invalid prelude '{{prelude}}' found for at-rule '@{{name}}'. Expected '{{expected}}'.",
			unknownDescriptor:
				"Unknown descriptor '{{descriptor}}' found for at-rule '@{{name}}'.",
			invalidDescriptor:
				"Invalid value '{{value}}' for descriptor '{{descriptor}}' found for at-rule '@{{name}}'. Expected {{expected}}.",
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
					if (error.reference) {
						const loc = node.loc;

						context.report({
							loc: {
								start: loc.start,
								end: {
									line: loc.start.line,

									// add 1 to account for the @ symbol
									column:
										loc.start.column + node.name.length + 1,
								},
							},
							messageId: "unknownAtRule",
							data: {
								name: node.name,
							},
						});
					} else {
						context.report({
							loc: error.loc,
							messageId: "invalidPrelude",
							data: {
								name: node.name,
								prelude: error.css,
								expected: error.syntax,
							},
						});
					}
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
					if (error.reference) {
						const loc = node.loc;

						context.report({
							loc: {
								start: loc.start,
								end: {
									line: loc.start.line,
									column:
										loc.start.column + node.property.length,
								},
							},
							messageId: "unknownDescriptor",
							data: {
								name: atRule.name,
								descriptor: error.reference,
							},
						});
					} else {
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
					}
				}
			},
		};
	},
};
