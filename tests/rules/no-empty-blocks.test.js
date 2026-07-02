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
					suggestions: [
						{ messageId: "deleteEmptyBlock", output: "" },
					],
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
					suggestions: [
						{ messageId: "deleteEmptyBlock", output: "" },
					],
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
					suggestions: [
						{ messageId: "deleteEmptyBlock", output: "" },
					],
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
					suggestions: [
						{ messageId: "deleteEmptyBlock", output: "" },
					],
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
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "",
						},
					],
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
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "\n@media print { \nb { } \n}", // only a{} was removed
						},
					],
				},
				{
					messageId: "emptyBlock",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 6,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "a { }\n@media print { \n \n}", // only b{} was removed
						},
					],
				},
			],
		},
		{
			code: "@layer defaults { \n }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 17,
					endLine: 2,
					endColumn: 3,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "@layer defaults ",
						},
					],
				},
			],
		},
		{
			code: "@supports not selector(h2 > p) { }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 32,
					endLine: 1,
					endColumn: 35,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "",
						},
					],
				},
			],
		},
		{
			code: "@keyframes a { 0% {} 100% {} }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 21,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "@keyframes a {  100% {} }",
						},
					],
				},
				{
					messageId: "emptyBlock",
					line: 1,
					column: 27,
					endLine: 1,
					endColumn: 29,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "@keyframes a { 0% {}  }",
						},
					],
				},
			],
		},
		{
			code: "@keyframes a { }",
			errors: [
				{
					messageId: "emptyBlock",
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 17,
					suggestions: [
						{
							messageId: "deleteEmptyBlock",
							output: "",
						},
					],
				},
			],
		},
	],
});
