/**
 * @fileoverview Tests for no-important rule.
 * @author Yann Bertrand
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-important.js";
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

ruleTester.run("no-important", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
		"body { padding: 0; }",
		"a { color: red; -moz-transition: bar }",
		"@font-face { font-weight: 100 400 }",
		'@property --foo { syntax: "*"; inherits: false; }',
	],
	invalid: [
		{
			code: "a { color: red !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: ".link { width: 100% !important }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "a .link { padding: 10px 20px 30px 40px !important }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
	],
});
