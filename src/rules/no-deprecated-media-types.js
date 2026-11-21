/**
 * @fileoverview Rule to disallow deprecated media types.
 * @author electrohyun
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @typedef {"deprecatedMediaType"} NoDeprecatedMediaTypesMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoDeprecatedMediaTypesMessageIds }>} NoDeprecatedMediaTypesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const deprecatedMediaTypes = new Set([
	"aural",
	"braille",
	"embossed",
	"handheld",
	"projection",
	"speech",
	"tty",
	"tv",
]);

const commentPattern = /\/\*[\s\S]*?\*\//gu;

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoDeprecatedMediaTypesRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		docs: {
			description: "Disallow deprecated media types",
			dialects: ["CSS"],
			recommended: false,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-deprecated-media-types.md",
		},

		messages: {
			deprecatedMediaType:
				"Unexpected deprecated media type '{{mediaType}}'.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		return {
			"Atrule[name=/^media$/i] > AtrulePrelude > MediaQueryList > MediaQuery"(
				node,
			) {
				const { mediaType } = node;

				if (!deprecatedMediaTypes.has(mediaType?.toLowerCase())) {
					return;
				}

				const text = sourceCode.getText(node);

				const textWithoutComments = text.replace(
					commentPattern,
					comment => " ".repeat(comment.length),
				);

				const startIndex =
					node.loc.start.offset +
					textWithoutComments.indexOf(mediaType);

				const endIndex = startIndex + mediaType.length;

				context.report({
					loc: {
						start: sourceCode.getLocFromIndex(startIndex),
						end: sourceCode.getLocFromIndex(endIndex),
					},
					messageId: "deprecatedMediaType",
					data: { mediaType },
				});
			},
		};
	},
});
