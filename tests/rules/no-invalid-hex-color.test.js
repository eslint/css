/**
 * @fileoverview Tests for invalid hex colors
 * @author Akul Srivastava
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-hex-color.js";
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

ruleTester.run("no-invalid-hex-color", rule, {
	valid: [
		{ code: "a { color: #0000FF }" },
		{ code: "#title { color: #fff }" },
		{ code: ".box { border: 1px solid #fcfcfc }" },
		{ code: ".box { background: red; }" },
	],
	invalid: [
		{
			code: "a { color: #0000FZ }",
			errors: [
				{
					messageId: "invalidHexColor",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "a { color: #0 }",
			errors: [
				{
					messageId: "invalidHexColor",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: "a { color: #ffxxzz }",
			errors: [
				{
					messageId: "invalidHexColor",
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: ".box { color: #ab99001 }",
			errors: [
				{
					messageId: "invalidHexColor",
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
	],
});
