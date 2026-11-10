/**
 * @fileoverview Tests for no-deprecated-media-types rule.
 * @author electrohyun
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-deprecated-media-types.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: { css },
	language: "css/css",
});

ruleTester.run("no-deprecated-media-types", rule, {
	valid: [
		"@media all {}",
		"@media screen {}",
		"@media print {}",
		'@import "legacy.css" aural;', // @import rules are outside the scope of this rule.
	],
	invalid: [
		{
			code: "@media aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "@media braille {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "braille" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "@media embossed {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "embossed" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "@media handheld {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "handheld" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "@media projection {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "projection" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "@media speech {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "speech" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "@media tty {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "tty" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "@media tv {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "tv" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "@media screen, aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "@media aural, braille {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "braille" },
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: "@media Aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "@media AURAL {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "@media aural and (width: 100px) {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "@media not aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "@media only aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 13,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "@media\n  aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 2,
					column: 3,
					endLine: 2,
					endColumn: 8,
				},
			],
		},
		{
			code: "@media /* comment */ aural {}",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "@media screen { @media aural {} }",
			errors: [
				{
					messageId: "deprecatedMediaType",
					data: { mediaType: "aural" },
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
	],
});
