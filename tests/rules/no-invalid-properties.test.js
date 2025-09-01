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
		"a { color: VAR(--my-color, red) }",
		":root { --my-heading: 3rem; }\na { color: vAr(--my-color, red) }",
		":root { --my-heading: 3rem; --foo: red }\na { color: VAR(--my-color, VAR(--foo, blue)) }",
		":root { --my-heading: 3rem; }\na { color: VAR(--my-color, vAr(--foo, blue)) }",
		"a { color: vAR(--my-color, VaR(--foo, VAR(--bar, blue))) }",
		":root { --my-color: red; }\na { color: Var(--my-color, blue) }",
		":root { --my-fallback: red; }\na { color: var(--my-color, VAR(--my-fallback)) }",
		":root { --my-fallback: red; }\na { color: VAR(--my-color, var(--my-fallback, blue)) }",
		":root { --foo: red; }\na { color: vAr(--my-color, VAR(--my-fallback, VaR(--foo))) }",
		"a { color: VAR(--my-color, vAr(--my-fallback, VAR(--foo, blue))) }",
		":root { --my-color: red; }\na { color: Var(--my-color, VAR(--fallback-color)) }",
		":root { --my-color: red; --fallback-color: blue; }\na { color: VAR(--my-color, var(--fallback-color)) }",
		":root { --my-color: red; }\na { color: var(--my-color, VaR(--fallback-color, blue)) }",
		":root { --my-color: red; }\na { color: VAR(--my-color, vAr(--fallback-color, VAR(--foo))) }",
		":root { --my-color: red; }\na { color: vAr(--my-color, VAR(--fallback-color, var(--foo, blue))) }",
		":root { --my-color: red; }\na { color: VAR(--my-color, vAr(--fallback-color, VAR(--foo, var(--bar)))) }",
		":root { --my-color: red; }\na { color: vAr(--my-color, VAR(--fallback-color, var(--foo, VaR(--bar, blue)))) }",
		":root { --color: red }\na { border-top: 1px VAR(--style, vAr(--fallback, solid)) VaR(--color, blue); }",
		":root { --MY-COLOR: red; }\na { color: var(--MY-COLOR) }",
		":root { --my-color: red; }\na { color: var(--MY-COLOR, red) }",
		":root { --MY-COLOR: red; }\na { color: var(--my-color, blue) }",
		":root { --FALLBACK-COLOR: blue; }\na { color: var(--MY-COLOR, var(--FALLBACK-COLOR)) }",
		":root { --fallback-color: blue; }\na { color: VAR(--MY-COLOR, VaR(--fallback-color)) }",
		"a { color: var(--my-color,\n  red) }",
		":root { --my-color: red; }\na { color: var(--my-color,\n blue) }",
		"a { color: var(--x,\n    var(--y,\n      blue\n    )\n) }",
		"a { color: var(--x,\n    red   ) }",
		":root { --a: var(--b,\n  10px\n); } a { padding: var(--a); }",
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
			code: "a { color: VAR(--my-color); }",
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
		{
			code: ":root { --color: red }\na { border-top: 1px VAR(--style, VAR(--fallback)) VAR(--color, blue); }",
			options: [{ allowUnknownVariables: true }],
		},
		":root { --a: red; --b: var(--a); }\na { color: var(--b); }",
		":root { --a: red; --b: var(--a); }\na { color: var(  --b  ); }",
		":root { --a: red; --b: var(--a); --c: var(--b); }\na { color: var(--c); }",
		":root { --a: red; }\na { color: var(--b, var(--a)); }",
		":root { --a: red; }\na { color: var(--b, var(--c, var(--a))); }",
		":root { --a: 1px; --b: red; --c: var(--a); --d: var(--b); }\na { border-top: var(--c) solid var(--d); }",
		":root { --a: 1px; --b: var(--a); }\na { border-top: var(--b) solid var(--c, red) }",
		":root { --a: var(--b, 10px); } a { padding: var(--a); }",
		":root { --a: var(--b, var(--c, 10px)); } a { padding: var(--a); }",
		":root { --a: var(--b, var(--c, 10px)); --b: 20px; } a { padding: var(--a); }",
		{
			code: ":root { --a: var(--c); --b: var(--a); }\na { color: var(--b); }",
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
		//
		// https://github.com/eslint/css/issues/235
		"a { color: rgb(from green r g b / 0.5) }",
		"a { color: rgb(from #123456 calc(r + 40) calc(g + 40) b) }",
		"a { color: rgb(from hwb(120deg 10% 20%) r g calc(b + 200)) }",
		"a { color: rgb(from hsl(0 100% 50%) r g b) }",
		"a { color: rgb(from hsl(0 100% 50% / 0.8) r g b / alpha) }",
		"a { color: rgb(from hsl(0 100% 50% / 0.8) r g b / 0.5) }",
		"a { color: rgb(from hsl(0 100% 50%) calc(r/2) calc(g + 25) calc(b + 175) / calc(alpha - 0.1)) }",
		"a { color: rgba(from green r g b / 0.5) }",
		"a { color: rgba(from #123456 calc(r + 40) calc(g + 40) b) }",
		"a { color: rgba(from hwb(120deg 10% 20%) r g calc(b + 200)) }",
		"a { color: rgba(from hsl(0 100% 50%) r g b) }",
		"a { color: rgba(from hsl(0 100% 50% / 0.8) r g b / alpha) }",
		"a { color: rgba(from hsl(0 100% 50% / 0.8) r g b / 0.5) }",
		"a { color: rgba(from hsl(0 100% 50%) calc(r/2) calc(g + 25) calc(b + 175) / calc(alpha - 0.1)) }",
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
			code: "a { color: var(--MY-COLOR); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--MY-COLOR",
					},
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		{
			code: "a { --my-color: red; color: var(--MY-COLOR); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--MY-COLOR",
					},
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 43,
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
			code: "a { color: var(--MY-COLOR, var(--FALLBACK-COLOR)); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--MY-COLOR",
					},
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
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
			code: "a { color: VAR(--my-color); }",
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
			code: "a { border-top: 1px vAr(--style, solid) VaR(--color); }",
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
			code: ":root { --style: foo }\na { border-top: 1px VAR(--style) VAR(--color, red); }",
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
			code: ":root { --style: foo }\na { border-top: 1px VAR(--style, solid) VAR(--color, red); }",
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
			code: ":root { --color: foo }\na { border-top: 1px VAR(--style, VAR(--fallback, solid)) VAR(--color); }",
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
			code: ":root { --color: foo }\na { border-top: 1px VAR(--style, VAR(--fallback)) VAR(--color); }",
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
			code: ":root { --color: foo }\na { border-top: 1px VAR(--style, VAR(--fallback)) VAR(--color); }",
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
			code: ":root { --color: red }\na { colorr: VAR(--color, blue); }",
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
			code: ":root { --a: var(--b); }\na { color: var(--a); }",
			errors: [
				{
					messageId: "unknownVar",
					data: { var: "--a" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: ":root { --a: var(--c); --b: var(--a); }\na { color: var(--b); }",
			errors: [
				{
					messageId: "unknownVar",
					data: { var: "--b" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: ":root { --a: var(--b); --b: var(--c); }\na { color: var(--a); }",
			errors: [
				{
					messageId: "unknownVar",
					data: { var: "--a" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: ":root { --a: var(--c); --b: var(--a); }\na { color: var(--d, var(--b)); }",
			errors: [
				{
					messageId: "unknownVar",
					data: { var: "--d" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: ":root { --a: foo; --b: var(--a); }\na { border-top: 1px var(--b) var(--c, red); }",
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
					endColumn: 29,
				},
			],
		},
		{
			code: ":root { --a: foo; --b: var(--a); }\na { border-top: 1px var(--b, solid) var(--c, red); }",
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
					endColumn: 36,
				},
			],
		},
		{
			code: ":root { --a: foo; --b: var(--a); }\na { border-top: 1px var(--c, var(--d, solid)) var(--b); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "border-top",
						value: "foo",
						expected: "<line-width> || <line-style> || <color>",
					},
					line: 2,
					column: 47,
					endLine: 2,
					endColumn: 55,
				},
			],
		},
		{
			code: ":root { --a: foo; --b: var(--a); }\na { border-top: 1px var(--c, var(--d)) var(--b); }",
			errors: [
				{
					messageId: "unknownVar",
					data: {
						var: "--c",
					},
					line: 2,
					column: 25,
					endLine: 2,
					endColumn: 28,
				},
			],
		},
		{
			code: ":root { --a: red; --b: var(--a); }\na { colorr: var(--b, blue); }",
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
			code: ":root { --a: foo; --b: var(--a); }\na { border-top: 1px var(--c, var(--d)) var(--b); }",
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
					column: 40,
					endLine: 2,
					endColumn: 48,
				},
			],
		},
		{
			code: ":root { --a: var(--b); --b: var(--a); }\na { color: var(--a); }",
			errors: [
				{
					messageId: "unknownVar",
					data: { var: "--a" },
					line: 2,
					column: 16,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: ":root { --a: var(--b,\n red); }\na { padding-top: var(--a); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "padding-top",
						value: "red",
						expected: "<length-percentage [0,∞]>",
					},
					line: 3,
					column: 18,
					endLine: 3,
					endColumn: 26,
				},
			],
		},
		{
			code: "a { padding-top: var(--a,\nvar(--b, red\n)\n); }",
			options: [{ allowUnknownVariables: true }],
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "padding-top",
						value: "red",
						expected: "<length-percentage [0,∞]>",
					},
					line: 1,
					column: 18,
					endLine: 4,
					endColumn: 2,
				},
			],
		},
		{
			code: ":root { --a: var(--b, red); }\na { padding-top: var(--a); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "padding-top",
						value: "red",
						expected: "<length-percentage [0,∞]>",
					},
					line: 2,
					column: 18,
					endLine: 2,
					endColumn: 26,
				},
			],
		},
		{
			code: ":root { --a: var(--b, var(--c, red)); }\na { padding-top: var(--a); }",
			errors: [
				{
					messageId: "invalidPropertyValue",
					data: {
						property: "padding-top",
						value: "red",
						expected: "<length-percentage [0,∞]>",
					},
					line: 2,
					column: 18,
					endLine: 2,
					endColumn: 26,
				},
			],
		},
	],
});
