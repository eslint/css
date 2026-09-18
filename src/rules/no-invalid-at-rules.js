/**
 * @fileoverview Rule to prevent the use of unknown at-rules in CSS.
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
 * @import { SourceLocation } from "@eslint/core"
 * @import { AtrulePlain } from "@eslint/css-tree"
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CSSSourceCode } from "../languages/css-source-code.js"
 * @typedef {"unknownAtRule" | "invalidPrelude" | "unknownDescriptor" | "invalidDescriptor" | "invalidExtraPrelude" | "missingPrelude" | "invalidCharsetSyntax"} NoInvalidAtRulesMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoInvalidAtRulesMessageIds }>} NoInvalidAtRulesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Set of at-rules that can be nested inside style rules.
 * @see https://www.w3.org/TR/css-nesting-1/#conditionals
 */
const nestableAtRules = new Set([
	"media",
	"supports",
	"layer",
	"scope",
	"container",
	"starting-style",
]);

/**
 * Map of at-rules that are only valid directly inside of another at-rule. Each
 * key is an at-rule name and each value is the name of the at-rule it must be
 * nested in.
 * @see https://drafts.csswg.org/css-page-3/#margin-at-rules
 * @see https://drafts.csswg.org/css-fonts-4/#font-feature-values-syntax
 */
const requiredParentAtRules = new Map([
	// margin at-rules
	["top-left-corner", "page"],
	["top-left", "page"],
	["top-center", "page"],
	["top-right", "page"],
	["top-right-corner", "page"],
	["bottom-left-corner", "page"],
	["bottom-left", "page"],
	["bottom-center", "page"],
	["bottom-right", "page"],
	["bottom-right-corner", "page"],
	["left-top", "page"],
	["left-middle", "page"],
	["left-bottom", "page"],
	["right-top", "page"],
	["right-middle", "page"],
	["right-bottom", "page"],

	// feature value blocks
	["stylistic", "font-feature-values"],
	["historical-forms", "font-feature-values"],
	["styleset", "font-feature-values"],
	["character-variant", "font-feature-values"],
	["swash", "font-feature-values"],
	["ornaments", "font-feature-values"],
	["annotation", "font-feature-values"],
]);

/**
 * A valid `@charset` rule must:
 * - Enclose the encoding name in double quotes
 * - Include exactly one space character after `@charset`
 * - End immediately with a semicolon
 */
const charsetPattern = /^@charset "[^"]+";$/u;
const charsetEncodingPattern = /^['"]?([^"';]+)['"]?/u;

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

/**
 * Calculates the location of an at-rule's name, including the `@` symbol.
 * @param {AtrulePlain} node The at-rule to calculate the location for.
 * @returns {SourceLocation} The location of the at-rule's name.
 */
function getAtRuleNameLoc(node) {
	const { start } = node.loc;

	return {
		start,
		end: {
			line: start.line,
			column: start.column + node.name.length + 1,
		},
	};
}

/**
 * Determines if an at-rule that must be nested inside of another at-rule, such
 * as `@top-left` inside of `@page`, is nested inside of that at-rule.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @param {AtrulePlain} node The at-rule to check.
 * @returns {boolean} `true` if the at-rule requires a parent at-rule and is
 *      nested inside of it, `false` otherwise.
 */
function isInRequiredParentAtRule(sourceCode, node) {
	const parentName = requiredParentAtRules.get(node.name.toLowerCase());

	if (!parentName) {
		return false;
	}

	const parent = sourceCode.getParent(sourceCode.getParent(node));

	return (
		parent?.type === "Atrule" && parent.name.toLowerCase() === parentName
	);
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoInvalidAtRulesRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		fixable: "code",

		docs: {
			description: "Disallow invalid at-rules",
			dialects: ["CSS"],
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
			invalidCharsetSyntax:
				"Invalid @charset syntax. Expected '@charset \"{{encoding}}\";'.",
		},
	},

	create(context) {
		const { sourceCode } = context;
		const lexer = sourceCode.lexer;

		/**
		 * Validates a `@charset` rule for correct syntax:
		 * - Verifies the rule name is exactly "charset" (case-sensitive)
		 * - Ensures the rule has a prelude
		 * - Validates the prelude matches the expected pattern
		 * @param {AtrulePlain} node The node representing the rule.
		 * @returns {void}
		 */
		function validateCharsetRule(node) {
			const { name, prelude, loc } = node;

			const charsetNameLoc = getAtRuleNameLoc(node);

			if (name !== "charset") {
				context.report({
					loc: charsetNameLoc,
					messageId: "unknownAtRule",
					data: {
						name,
					},
					fix(fixer) {
						return fixer.replaceTextRange(
							[
								loc.start.offset,
								loc.start.offset + name.length + 1,
							],
							"@charset",
						);
					},
				});
				return;
			}

			if (!prelude) {
				context.report({
					loc: charsetNameLoc,
					messageId: "missingPrelude",
					data: {
						name,
					},
				});
				return;
			}

			const nodeText = sourceCode.getText(node);
			const preludeText = sourceCode.getText(prelude);
			const encoding = preludeText
				.match(charsetEncodingPattern)?.[1]
				?.trim();

			if (!encoding) {
				context.report({
					loc: prelude.loc,
					messageId: "invalidCharsetSyntax",
					data: { encoding: "<charset>" },
				});
				return;
			}

			if (!charsetPattern.test(nodeText)) {
				context.report({
					loc: prelude.loc,
					messageId: "invalidCharsetSyntax",
					data: { encoding },
					fix(fixer) {
						return fixer.replaceText(
							node,
							`@charset "${encoding}";`,
						);
					},
				});
			}
		}

		return {
			Atrule(node) {
				const name = node.name.toLowerCase();

				if (name === "charset") {
					validateCharsetRule(node);
					return;
				}

				if (
					!lexer.getAtrule(name) &&
					isInRequiredParentAtRule(sourceCode, node)
				) {
					// none of these at-rules accept a prelude
					if (node.prelude) {
						context.report({
							loc: getAtRuleNameLoc(node),
							messageId: "invalidExtraPrelude",
							data: {
								name: node.name,
							},
						});
					}

					return;
				}

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

					context.report({
						loc: getAtRuleNameLoc(node),
						...extractMetaDataFromError(error),
					});
				}
			},

			"AtRule > Block > Declaration"(node) {
				// skip custom descriptors
				if (node.property.startsWith("--")) {
					return;
				}

				// get at rule node
				const atRule = /** @type {AtrulePlain} */ (
					sourceCode.getParent(sourceCode.getParent(node))
				);

				const atRuleName = atRule.name.toLowerCase();

				if (nestableAtRules.has(atRuleName)) {
					return;
				}

				if (
					!lexer.getAtrule(atRuleName) &&
					isInRequiredParentAtRule(sourceCode, atRule)
				) {
					return;
				}

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
});
