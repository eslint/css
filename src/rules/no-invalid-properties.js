/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"invalidPropertyValue" | "unknownProperty"} NoInvalidPropertiesMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidPropertiesMessageIds }>} NoInvalidPropertiesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { isSyntaxMatchError } from "../util.js";

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
		},
	},

	create(context) {
		const lexer = context.sourceCode.lexer;

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

					/*
					 * There's no current way to get lexing to work when a
					 * `var()` is present in a value. Rather than blowing up,
					 * we'll just ignore it.
					 *
					 * https://github.com/csstree/csstree/issues/317
					 */

					if (error.message.endsWith("var() is not supported")) {
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
