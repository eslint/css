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
		":root { --my-color: red; }\na { color: var(--my-color) }",
		":root { --my-color: red; }\na { color: var(   --my-color   ) }",
		":root { --my-color: red;\n.foo { color: var(--my-color) }\n}",
		".fluidHeading {font-size: clamp(2.1rem, calc(7.2vw - 0.2rem), 2.5rem);}",
		"a { color: var(--my-color, red) }",
		":root { --my-heading: 3rem; }\na { color: var(--my-color, red) }",
		":root { --my-heading: 3rem; --foo: red }\na { color: var(--my-color, var(--foo, blue)) }",
		":root { --my-heading: 3rem; }\na { color: var(--my-color, var(--foo, blue)) }",
		"a { color: var(--my-color, var(--foo, var(--bar, blue))) }",
		":root { --my-color: red; }\na { color: var(--my-color, blue) }",
		":root { --my-fallback: red; }\na { color: var(--my-color, var(--my-fallback)) }",
		":root { --my-fallback: red; }\na { color: var(--my-color, var(--my-fallback, blue)) }",
		":root { --foo: red; }\na { color: var(--my-color, var(--my-fallback, var(--foo))) }",
		"a { color: var(--my-color, var(--my-fallback, var(--foo, blue))) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color)) }",
		":root { --my-color: red; --fallback-color: blue; }\na { color: var(--my-color, var(--fallback-color)) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color, blue)) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color, var(--foo))) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color, var(--foo, blue))) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color, var(--foo, var(--bar)))) }",
		":root { --my-color: red; }\na { color: var(--my-color, var(--fallback-color, var(--foo, var(--bar, blue)))) }",
		":root { --color: red }\na { border-top: 1px var(--style, var(--fallback, solid)) var(--color, blue); }",
		"a { width: calc(var(--my-width, 100px)) }",
		":root { --my-heading: 3rem; }\na { width: calc(var(--my-width, 100px)) }",
		":root { --my-heading: 3rem; --foo: 100px }\na { width: calc(var(--my-width, var(--foo, 200px))) }",
		":root { --my-heading: 3rem; }\na { width: calc(var(--my-width, var(--foo, 200px))) }",
		"a { width: calc(var(--my-width, var(--foo, var(--bar, 200px)))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, 200px)) }",
		":root { --my-fallback: 100px; }\na { width: calc(var(--my-width, var(--my-fallback))) }",
		":root { --my-fallback: 100px; }\na { width: calc(var(--my-width, var(--my-fallback, 200px))) }",
		":root { --foo: 100px; }\na { width: calc(var(--my-width, var(--my-fallback, var(--foo)))) }",
		"a { width: calc(var(--my-width, var(--my-fallback, var(--foo, 200px)))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width))) }",
		":root { --my-width: 100px; --fallback-width: 200px; }\na { width: calc(var(--my-width, var(--fallback-width))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width, 200px))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width, var(--foo)))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width, var(--foo, 200px)))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width, var(--foo, var(--bar))))) }",
		":root { --my-width: 100px; }\na { width: calc(var(--my-width, var(--fallback-width, var(--foo, var(--bar, 200px))))) }",
		":root { --width: 1px; }\na { border-top: calc(var(--width, 2px)) var(--style, var(--fallback, solid)) red; }",
		":root { --width: 100px; }\na { width: calc(calc(100% - var(--width))); }",
		":root { --width: 100px; }\na { width: calc(calc(var(--width) + 50px) - 25px); }",
		":root { --color: red; }\na { background: linear-gradient(to right, var(--color), blue); }",
		":root { --color: red; --offset: 10px; }\na { transform: translateX(calc(var(--offset) + 20px)); }",
		":root { --width: 100px; }\na { width: clamp(50px, var(--width), 200px); }",
		":root { --width: 100px; }\na { width: min(var(--width), 150px); }",
		":root { --width: 100px; }\na { width: max(var(--width), 50px); }",
		":root { --width: 100px; }\na { width: calc(min(var(--width), 150px) + 10px); }",
		":root { --width: 100px; }\na { width: calc(max(var(--width), 50px) - 5px); }",
		":root { --width: 100px; }\na { width: calc(clamp(50px, var(--width), 200px) / 2); }",
		":root { --color: red; }\na { filter: drop-shadow(0 0 10px var(--color)); }",
		":root { --color: red; }\na { background: radial-gradient(circle, var(--color), transparent); }",
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
		{
			code: "a { color: var(--my-color); }",
			options: [{ allowUnknownVariables: true }],
		},
		{
			code: "a { width: calc(var(--width)); }",
			options: [{ allowUnknownVariables: true }],
		},
		{
			code: "a { --my-color: red; color: var(--my-color); background-color: var(--unknown-var); }",
			options: [{ allowUnknownVariables: true }],
		},
		{
			code: ":root { --color: red }\na { border-top: 1px var(--style, var(--fallback)) var(--color, blue); }",
			options: [{ allowUnknownVariables: true }],
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
			code: "a { border-top: 10px solid foo }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "10px solid foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 1,
					column: 28,
					endLine: 1,
					endColumn: 31,
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
							"auto | <length-percentage [0,∞]> | min-content | max-content | fit-content | fit-content( <length-percentage [0,∞]> ) | <calc-size()> | <anchor-size()> | stretch | <-non-standard-size>",
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
						expected: "<'margin-top'>{1,4}",
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
		{
			code: "a { color: var(--my-color); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--my-color",
					},
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		{
			code: "a { .foo { color: var(--undefined-var); } }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--undefined-var",
					},
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 38,
				},
			],
		},
		{
			code: "a { --my-color: 10px; color: var(--my-color); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "10px",
						expected: "<color>",
					},
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 45,
				},
			],
		},
		{
			code: "a { --my-color: 10px; color: var(--my-color); background-color: var(--my-color); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "10px",
						expected: "<color>",
					},
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 45,
				},
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "background-color",
						value: "10px",
						expected: "<color>",
					},
					line: 1,
					column: 65,
					endLine: 1,
					endColumn: 80,
				},
			],
		},
		{
			code: "a { --my-color: 10px; color: var(--my-color); background-color: var(--unknown-var); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "10px",
						expected: "<color>",
					},
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 45,
				},
				{
					messageId: "unknownVar",
					data: {
						var: "--unknown-var",
					},
					line: 1,
					column: 69,
					endLine: 1,
					endColumn: 82,
				},
			],
		},
		{
			code: "a { --width: 1px; border-top: var(--width) solid bar; }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "bar",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 53,
				},
			],
		},
		{
			code: "a { --width: baz; --style: foo; border-top: var(--width) var(--style) bar; }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "baz",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 1,
					column: 45,
					endLine: 1,
					endColumn: 57,
				},
			],
		},
		{
			code: "a { --width: 1px; border-top: var(--width) solid var(--width); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "1px",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 62,
				},
			],
		},
		{
			code: "a { colorr: var(--my-color); }",
			options: [{ allowUnknownVariables: true }],
			errors: [
				{
					messageId: "unknownProperty",
					data: {
						property: "colorr",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "a { --my-color: 10px; color: var(--my-color); background_color: var(--unknown-var); }",
			options: [{ allowUnknownVariables: true }],
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "color",
						value: "10px",
						expected: "<color>",
					},
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 45,
				},
				{
					messageId: "unknownProperty",
					data: {
						property: "background_color",
					},
					line: 1,
					column: 47,
					endLine: 1,
					endColumn: 63,
				},
			],
		},
		{
			code: "a { border-top: 1px var(--style, solid) var(--color); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--color",
					},
					line: 1,
					column: 45,
					endLine: 1,
					endColumn: 52,
				},
			],
		},
		{
			code: ":root { --style: foo }\na { border-top: 1px var(--style) var(--color, red); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 2,
					column: 21,
					endLine: 2,
					endColumn: 33,
				},
			],
		},
		{
			code: ":root { --style: foo }\na { border-top: 1px var(--style, solid) var(--color, red); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 2,
					column: 21,
					endLine: 2,
					endColumn: 40,
				},
			],
		},
		{
			code: ":root { --color: foo }\na { border-top: 1px var(--style, var(--fallback, solid)) var(--color); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 2,
					column: 58,
					endLine: 2,
					endColumn: 70,
				},
			],
		},
		{
			code: ":root { --color: foo }\na { border-top: 1px var(--style, var(--fallback)) var(--color); }",
			options: [{ allowUnknownVariables: true }],
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 2,
					column: 51,
					endLine: 2,
					endColumn: 63,
				},
			],
		},
		{
			code: ":root { --color: foo }\na { border-top: 1px var(--style, var(--fallback)) var(--color); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--style",
					},
					line: 2,
					column: 25,
					endLine: 2,
					endColumn: 32,
				},
			],
		},
		{
			code: ":root { --color: red }\na { colorr: var(--color, blue); }",
			errors: [
				{
					messageId: "unknownProperty",
					data: {
						property: "colorr",
					},
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 11,
				},
			],
		},
		{
			code: "a { padding: calc(var(--padding-top, 1px) + 1px) 2px calc(var(--padding-bottom) + 1px); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--padding-bottom",
					},
					line: 1,
					column: 63,
					endLine: 1,
					endColumn: 79,
				},
			],
		},
		{
			code: "a { padding: calc(var(--padding-top, var(--fallback))) 2px calc(var(--padding-bottom)); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--padding-top",
					},
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 36,
				},
			],
		},
		{
			code: ":root { --width: 100px }\na { widthh: calc(var(--width, 200px)); }",
			errors: [
				{
					messageId: "unknownProperty",
					data: {
						property: "widthh",
					},
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 11,
				},
			],
		},
		{
			code: "a { padding: calc(max(var(--padding-top, var(--fallback))), 1px) 2px calc(var(--padding-bottom)); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--padding-top",
					},
					line: 1,
					column: 27,
					endLine: 1,
					endColumn: 40,
				},
			],
		},
		{
			code: "a { color: rgba(calc(var(--red, 255) + var(--green)), 0, calc(var(--blue)), 1); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--green",
					},
					line: 1,
					column: 44,
					endLine: 1,
					endColumn: 51,
				},
			],
		},
		{
			code: "a { transform: translateX(calc(var(--offset-x, min(var(--default-offset, 5px), 10px))) rotate(var(--rotation))); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--rotation",
					},
					line: 1,
					column: 99,
					endLine: 1,
					endColumn: 109,
				},
			],
		},
	],
});
