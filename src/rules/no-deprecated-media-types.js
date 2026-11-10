/**
 * @fileoverview Rule to disallow deprecated media types.
 * @author electrohyun
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { tokenize, tokenTypes } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SourceLocation } from "@eslint/core"
 * @import { MediaQueryPlain } from "@eslint/css-tree"
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CSSSourceCode } from "../languages/css-source-code.js"
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

/**
 * Gets the location of the media type in a media query.
 * @param {CSSSourceCode} sourceCode The source code object.
 * @param {MediaQueryPlain} node The media query node.
 * @returns {SourceLocation} The media type location.
 */
function getMediaTypeLocation(sourceCode, node) {
	let location;
	const text = sourceCode.getText(node);

	tokenize(text, (type, start, end) => {
		if (location || type !== tokenTypes.Ident) {
			return;
		}

		const tokenText = text.slice(start, end).toLowerCase();

		if (tokenText === "not" || tokenText === "only") {
			return;
		}

		const startIndex = node.loc.start.offset + start;
		const endIndex = node.loc.start.offset + end;

		location = {
			start: sourceCode.getLocFromIndex(startIndex),
			end: sourceCode.getLocFromIndex(endIndex),
		};
	});

	return location;
}

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

				if (deprecatedMediaTypes.has(mediaType)) {
					const location = getMediaTypeLocation(
						context.sourceCode,
						node,
					);

					context.report({
						loc: location,
						messageId: "deprecatedMediaType",
						data: { mediaType },
					});
				}
			},
		};
	},
});
