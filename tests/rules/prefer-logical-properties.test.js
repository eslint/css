//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/prefer-logical-properties.js";
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

ruleTester.run("prefer-logical-properties", rule, {
	valid: [
		"a { margin-block: 10px; }",
		"a { padding-inline: 20px; }",
		"a { margin: 10px; }",
		"a { padding: 20px; }",
		"a { text-align: start }",
	],
	invalid: [
		{
			code: "a { margin-top: 10px; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 21,
					data: {
						property: "margin-top",
						replacement: "margin-block-start",
					},
				},
			],
		},
		{
			code: "a { padding-top: 20px; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 22,
					data: {
						property: "padding-top",
						replacement: "padding-block-start",
					},
				},
			],
		},
		{
			code: "a { text-align: left }",
			errors: [
				{
					messageId: "notLogicalValue",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 21,
					data: {
						value: "left",
						replacement: "start",
					},
				},
			],
		},
		{
			code: "a { block-size: 100vh }",
			errors: [
				{
					messageId: "notLogicalUnit",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 22,
					data: {
						unit: "vh",
						replacement: "vb",
					},
				},
			],
		},
	],
});
