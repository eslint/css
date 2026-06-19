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
		"@supports (text-align: left) {}",
		"@supports (padding-left: 10px) {}",
		{
			code: "a { padding-left: 20px; }",
			options: [
				{
					allowProperties: ["padding-left"],
				},
			],
		},
		{
			code: "a { inline-size: 100vw; }",
			options: [
				{
					allowUnits: ["vw"],
				},
			],
		},
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
					suggestions: [
						{
							desc: "Replace 'margin-top' with logical property 'margin-block-start'.",
							output: "a { margin-block-start: 10px; }",
						},
					],
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
					suggestions: [
						{
							desc: "Replace 'padding-top' with logical property 'padding-block-start'.",
							output: "a { padding-block-start: 20px; }",
						},
					],
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
					suggestions: [
						{
							desc: "Replace 'left' with logical value 'start'.",
							output: "a { text-align: start }",
						},
					],
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
					suggestions: [
						{
							desc: "Replace 'vh' with logical unit 'vb'.",
							output: "a { block-size: 100vb }",
						},
					],
				},
			],
		},
	],
});
