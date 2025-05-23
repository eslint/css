/**
 * @fileoverview Tests for no-important rule.
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-important.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";
import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		css,
	},
	language: "css/css",
});

ruleTester.run("no-important", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
		"body { --custom-property: important; }",
		"body { padding: 0; }",
		"a { color: red; -moz-transition: bar }",
		"@font-face { font-weight: 100 400 }",
		'@property --foo { syntax: "*"; inherits: false; }',
		"a { --my-color: red; color: var(--my-color) }",
		{
			code: "a { my-custom-color: red; }",
			languageOptions: {
				customSyntax: {
					properties: {
						"my-custom-color": "<color>",
					},
				},
			},
		},
		"@keyframes important { from { margin: 1px; } }",
		"@-webkit-keyframes important { from { margin: 1px; } }",
		"@-WEBKIT-KEYFRAMES important { from { margin: 1px; } }",
	],
	invalid: [
		{
			code: "a { color: red !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		{
			code: "a { color:red!important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "a { padding: 10px 20px 30px 40px ! important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 45,
				},
			],
		},
		{
			code: "a { border: 0 !IMPORTANT; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: "a { color: red !important; margin: 0 ! important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
				},
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 38,
					endLine: 1,
					endColumn: 49,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						! important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 14,
				},
			],
		},
		{
			code: "a { color: red /* comment */ !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 40,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red /* comment */
						!important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
				},
			],
		},
		{
			code: "a { color: red !/* comment */important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: "a { color: red ! /* comment */ important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 41,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!/* comment */important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 26,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						! /* comment */ important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 28,
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!important;
					margin: 0
						! important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
				},
				{
					messageId: "unexpectedImportant",
					line: 5,
					column: 3,
					endLine: 5,
					endColumn: 14,
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
				},
			],
		},
		{
			code: "@-webkit-keyframes important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 61,
				},
			],
		},
		{
			code: "@-WEBKIT-KEYFRAMES important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 61,
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px!important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 52,
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px ! important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 54,
				},
			],
		},
		{
			code: "@kEyFrAmEs important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
				},
			],
		},
		{
			code: "@KEYFRAMES important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
				},
			],
		},
	],
});
