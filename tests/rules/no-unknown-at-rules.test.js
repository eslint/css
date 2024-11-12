/**
 * @fileoverview Tests for no-unknown-at-rules rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-unknown-at-rules.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		css,
	},
	language: "css/css",
});

ruleTester.run("no-unknown-at-rules", rule, {
	valid: [
		"@import url('styles.css');",
		"@font-face { font-family: 'MyFont'; src: url('myfont.woff2') format('woff2'); }",
		"@keyframes slidein { from { transform: translateX(0%); } to { transform: translateX(100%); } }",
		"@supports (display: grid) { .grid-container { display: grid; } }",
		"@namespace url(http://www.w3.org/1999/xhtml);",
		"@media screen and (max-width: 600px) { body { font-size: 12px; } }",
	],
	invalid: [
		{
			code: "@foobar { }",
			errors: [
				{
					messageId: "unknownAtRule",
					data: { name: "foobar" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "@foobaz { }",
			errors: [
				{
					message: "Unknown at-rule 'foobaz' found.",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "@unknownrule { } @anotherunknown { }",
			errors: [
				{
					messageId: "unknownAtRule",
					data: { name: "unknownrule" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "unknownAtRule",
					data: { name: "anotherunknown" },
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 33,
				},
			],
		},
	],
});
