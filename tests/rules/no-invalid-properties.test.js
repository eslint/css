/**
 * @fileoverview Tests for no-invalid-properties rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-properties.js";
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

ruleTester.run("no-invalid-properties", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
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

		/*
		 * CSSTree doesn't currently support custom functions properly, so leaving
		 * these out for now.
		 * https://github.com/csstree/csstree/issues/292
		 */
		// {
		// 	code: "a { my-custom-color: theme(colors.red); }",
		// 	languageOptions: {
		// 		customSyntax: {
		// 			properties: {
		// 				"my-custom-color": "<color> | <tailwind-theme()>",
		// 			},
		// 			types: tailwindSyntax.types,
		// 		},
		// 	},
		// },
	],
	invalid: [
		{
			code: "a { color: bar }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "bar",
						expected: "<color>",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "a { width: red }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "width",
						value: "red",
						expected:
							"auto | <length> | <percentage> | min-content | max-content | fit-content | fit-content( <length-percentage> ) | stretch | <-non-standard-size>",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "a { margin: 10px 20px 30px 40px 50px }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "margin",
						value: "10px 20px 30px 40px 50px",
						expected: "[ <length> | <percentage> | auto ]{1,4}",
					},
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 37,
				},
			],
		},
		{
			code: "a { display: flexbox }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "display",
						value: "flexbox",
						expected:
							"[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy> | <-non-standard-display>",
					},
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "a { color: #ff0000X; }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "#ff0000X",
						expected: "<color>",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "a {\n    color: #ff0000x;\n    display: flexbox;\n}",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "#ff0000x",
						expected: "<color>",
					},
					line: 2,
					column: 12,
					endLine: 2,
					endColumn: 20,
				},
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "display",
						value: "flexbox",
						expected:
							"[ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy> | <-non-standard-display>",
					},
					line: 3,
					column: 14,
					endLine: 3,
					endColumn: 21,
				},
			],
		},
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
			],
		},
		{
			code: "a { my-custom-color: solid; }",
			languageOptions: {
				customSyntax: {
					properties: {
						"my-custom-color": "<color>",
					},
				},
			},
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "my-custom-color",
						value: "solid",
						expected: "<color>",
					},
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
	],
});
