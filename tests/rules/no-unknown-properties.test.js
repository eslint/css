/**
 * @fileoverview Tests for no-unknown-properties rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-unknown-properties.js";
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

ruleTester.run("no-unknown-properties", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
	],
	invalid: [
		{
			code: "a { foo: bar }",
			errors: [
				{
					messageId: "unknownProperty",
					data: { property: "foo" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "a { color: red; -moz-transition: bar }",
			errors: [
				{
					messageId: "unknownProperty",
					data: { property: "-moz-transition" },
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 32,
				},
			],
		},
		{
			code: "a { my-color: red; -webkit-transition: bar }",
			errors: [
				{
					messageId: "unknownProperty",
					data: { property: "my-color" },
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 13,
				},
				{
					messageId: "unknownProperty",
					data: { property: "-webkit-transition" },
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 38,
				},
			],
		},
	],
});
