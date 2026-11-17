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
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-deprecated-media-types.md",
		},

		messages: {
			deprecatedMediaType:
				"Unexpected deprecated media type '{{mediaType}}'.",
		},
	},

	create(context) {
		return {
			"Atrule[name=/^media$/i] > AtrulePrelude > MediaQueryList > MediaQuery"(
				node,
			) {
				const mediaType = node.mediaType?.toLowerCase();

				if (!deprecatedMediaTypes.has(mediaType)) {
					return;
				}

				const text = context.sourceCode.getText(node);

				const startIndex =
					node.loc.start.offset +
					text.toLowerCase().indexOf(mediaType);

				const endIndex = startIndex + node.mediaType.length;

				const location = {
					start: context.sourceCode.getLocFromIndex(startIndex),
					end: context.sourceCode.getLocFromIndex(endIndex),
				};

				context.report({
					loc: location,
					messageId: "deprecatedMediaType",
					data: { mediaType },
				});
			},
		};
	},
});
