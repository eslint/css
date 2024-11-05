/**
 * @fileoverview Tests for no-empty-blocks rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-empty-blocks.js";
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

ruleTester.run("no-empty-blocks", rule, {
	valid: ["a { color: red; }", "@media print { a { color: red; } }"],
	invalid: [
		{
			code: "a { }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: "a { /* comment */ }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "a {\n}",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 3,
					endLine: 2,
					endColumn: 2,
				},
			],
		},
		{
			code: "a { \n }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 3,
					endLine: 2,
					endColumn: 3,
				},
			],
		},
		{
			code: "@media print { }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "a { }\n@media print { \nb { } \n}",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 6,
				},
				{
					messageId: "emptyBlock",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 6,
				},
			],
		},
	],
});
