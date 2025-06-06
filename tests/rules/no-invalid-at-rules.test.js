/**
 * @fileoverview Tests for no-invalid-at-rules rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-at-rules.js";
import css from "../../src/index.js";
import { tailwind3 } from "tailwind-csstree";
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

ruleTester.run("no-invalid-at-rules", rule, {
	valid: [
		"@import url('styles.css');",
		"@font-face { font-family: 'MyFont'; src: url('myfont.woff2') format('woff2'); }",
		"@keyframes slidein { from { transform: translateX(0%); } to { transform: translateX(100%); } }",
		"@supports (display: grid) { .grid-container { display: grid; } }",
		"@namespace url(http://www.w3.org/1999/xhtml);",
		"@media screen and (max-width: 600px) { body { font-size: 12px; } }",
		{
			code: "@foobar url(foo.css) { body { font-size: 12px } }",
			languageOptions: {
				customSyntax: {
					atrules: {
						foobar: {
							prelude: "<url>",
						},
					},
				},
			},
		},
		{
			code: "@tailwind base; @tailwind components; @tailwind utilities;",
			languageOptions: {
				customSyntax: tailwind3,
			},
		},
		{
			code: "a { @apply text-red-500; }",
			languageOptions: {
				customSyntax: tailwind3,
			},
		},
		{
			code: "a { @apply text-red-500 bg-blue-500; }",
			languageOptions: {
				customSyntax: tailwind3,
			},
		},
		{
			code: "@config 'tailwind.config.js';",
			languageOptions: {
				customSyntax: tailwind3,
			},
		},
		{
			code: `@custom-rule {
				--foo: red;
				--bar: blue;
			}`,
			languageOptions: {
				customSyntax: {
					atrules: {
						"custom-rule": {},
					},
				},
			},
		},
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
			code: '@charse "test";',
			errors: [
				{
					messageId: "unknownAtRule",
					data: { name: "charse" },
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
					message: "Unknown at-rule '@foobaz' found.",
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
		{
			code: "@property foo {  }",
			errors: [
				{
					messageId: "invalidPrelude",
					data: {
						name: "property",
						prelude: "foo",
						expected: "<custom-property-name>",
					},
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "@property --foo { baz: red; }",
			errors: [
				{
					messageId: "unknownDescriptor",
					data: { name: "property", descriptor: "baz" },
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 22,
				},
			],
		},
		{
			code: "@property --foo { syntax: red; }",
			errors: [
				{
					messageId: "invalidDescriptor",
					line: 1,
					data: {
						name: "property",
						descriptor: "syntax",
						value: "red",
						expected: "<string>",
					},
					column: 27,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: "@supports { a {} }",
			errors: [
				{
					messageId: "missingPrelude",
					data: { name: "supports" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "@font-face foo { }",
			errors: [
				{
					messageId: "invalidExtraPrelude",
					data: { name: "font-face" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "@foobar { body { font-size: 12px } }",
			languageOptions: {
				customSyntax: {
					atrules: {
						foobar: {
							prelude: "<url>",
						},
					},
				},
			},
			errors: [
				{
					messageId: "missingPrelude",
					data: { name: "foobar" },
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "a { @apply; }",
			languageOptions: {
				customSyntax: tailwind3,
			},
			errors: [
				{
					messageId: "missingPrelude",
					data: {
						name: "apply",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "@config;",
			languageOptions: {
				customSyntax: tailwind3,
			},
			errors: [
				{
					messageId: "missingPrelude",
					data: {
						name: "config",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "@config foo;",
			languageOptions: {
				customSyntax: tailwind3,
			},
			errors: [
				{
					messageId: "invalidPrelude",
					data: {
						name: "config",
						prelude: "foo",
						expected: "<string>",
					},
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
	],
});
