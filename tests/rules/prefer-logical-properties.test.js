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
		"a { MARGIN-BLOCK: 10px; }",
		"a { padding-inline: 20px; }",
		"a { PADDING-INLINE: 20PX; }",
		"a { margin: 10px; }",
		"a { padding: 20px; }",
		"a { text-align: start }",
		"a { TEXT-ALIGN: START }",
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
			code: "a { PADDING-LEFT: 20px; }",
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
		{
			code: "a { inline-size: 100VW; }",
			options: [
				{
					allowUnits: ["vw"],
				},
			],
		},
		{
			code: "a { transition: margin-left 1s; }",
			options: [
				{
					allowProperties: ["margin-left"],
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
					endColumn: 15,
					data: {
						property: "margin-top",
						replacement: "margin-block-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "margin-top",
								replacement: "margin-block-start",
							},
							output: "a { margin-block-start: 10px; }",
						},
					],
				},
			],
		},
		{
			code: "a { MARGIN-TOP: 10px; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 15,
					data: {
						property: "MARGIN-TOP",
						replacement: "margin-block-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "MARGIN-TOP",
								replacement: "margin-block-start",
							},
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
					endColumn: 16,
					data: {
						property: "padding-top",
						replacement: "padding-block-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "padding-top",
								replacement: "padding-block-start",
							},
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
							messageId: "replaceWithLogicalValue",
							data: {
								value: "left",
								replacement: "start",
							},
							output: "a { text-align: start }",
						},
					],
				},
			],
		},
		{
			code: "a { TEXT-ALIGN: LEFT }",
			errors: [
				{
					messageId: "notLogicalValue",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 21,
					data: {
						value: "LEFT",
						replacement: "start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalValue",
							data: {
								value: "LEFT",
								replacement: "start",
							},
							output: "a { TEXT-ALIGN: start }",
						},
					],
				},
			],
		},
		{
			code: "a { text-align-last: right }",
			errors: [
				{
					messageId: "notLogicalValue",
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 27,
					data: {
						value: "right",
						replacement: "end",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalValue",
							data: {
								value: "right",
								replacement: "end",
							},
							output: "a { text-align-last: end }",
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
							messageId: "replaceWithLogicalUnit",
							data: {
								unit: "vh",
								replacement: "vb",
							},
							output: "a { block-size: 100vb }",
						},
					],
				},
			],
		},
		{
			code: "a { BLOCK-SIZE: 100VH }",
			errors: [
				{
					messageId: "notLogicalUnit",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 22,
					data: {
						unit: "VH",
						replacement: "vb",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalUnit",
							data: {
								unit: "VH",
								replacement: "vb",
							},
							output: "a { BLOCK-SIZE: 100vb }",
						},
					],
				},
			],
		},
		{
			code: "a { transition: margin-left 1s; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 28,
					data: {
						property: "margin-left",
						replacement: "margin-inline-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "margin-left",
								replacement: "margin-inline-start",
							},
							output: "a { transition: margin-inline-start 1s; }",
						},
					],
				},
			],
		},
		{
			code: "a { TRANSITION: MARGIN-LEFT 1s; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 28,
					data: {
						property: "MARGIN-LEFT",
						replacement: "margin-inline-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "MARGIN-LEFT",
								replacement: "margin-inline-start",
							},
							output: "a { TRANSITION: margin-inline-start 1s; }",
						},
					],
				},
			],
		},
		{
			code: "a { transition-property: width, top; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 31,
					data: {
						property: "width",
						replacement: "inline-size",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "width",
								replacement: "inline-size",
							},
							output: "a { transition-property: inline-size, top; }",
						},
					],
				},
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 36,
					data: {
						property: "top",
						replacement: "inset-block-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "top",
								replacement: "inset-block-start",
							},
							output: "a { transition-property: width, inset-block-start; }",
						},
					],
				},
			],
		},
		{
			code: "a { will-change: left; }",
			errors: [
				{
					messageId: "notLogicalProperty",
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 22,
					data: {
						property: "left",
						replacement: "inset-inline-start",
					},
					suggestions: [
						{
							messageId: "replaceWithLogicalProperty",
							data: {
								property: "left",
								replacement: "inset-inline-start",
							},
							output: "a { will-change: inset-inline-start; }",
						},
					],
				},
			],
		},
	],
});
