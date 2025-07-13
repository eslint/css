import rule from "../../src/rules/font-family-fallbacks.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ plugins: { css }, language: "css/css" });

ruleTester.run("font-family-fallbacks", rule, {
	valid: [
		":root { --my-font: sans-serif; } a { font-family: var(--my-font); }",
		":root { --foo: 3rem; } a { font-family: var(--my-font); }",
		":root { --my-font: 'Arial', sans-serif; } a { font-family: var(--my-font); }",
		":root { --my-font: 'Arial', 'Segoe UI Emoji', serif; } a { font-family: var(--my-font); }",
		"a { font-family: serif; }",
		"a { font-family: sans-serif; }",
		"a { font-family: 'Arial', 'Segoe UI Emoji', serif; }",
		"a { font-family: 'Arial', var(--my-font); }",
		"a { font-family: 'Arial', var(--my-font), serif; }",
		":root { --my-font: sans-serif; } a { font-family: 'Arial', var(--my-font); }",
		":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font), serif; }",
		"a { font: caption; }",
		":root { --my-font-value: 1.2em 'Fira Sans', sans-serif } a { font: var(--my-font-value); }",
		":root { --my-font-value: 1.2em 'Arial', 'Open Sans', 'Fira Sans', system-ui } a { font: var(--my-font-value); }",
		"a { font: 16px sans-serif; }",
		"a { font: 16px Arial, sans-serif; }",
		"a { font: italic bold 1.2em 'Open Sans', sans-serif; }",
		"a { font: var(--my-font-value) 'Open Sans', sans-serif; }",
		"a { font: var(--font-size) sans-serif; }",
		"a { font: 1em var(--my-font), monospace }",
		"a { font: var(--font-size) 'Open Sans', sans-serif; }",
		":root { --my-font: sans-serif; } a { font: var(--font-size) 'Open Sans', var(--my-font); }",
		"a { font: var(--font-size) 'Open Sans', var(--my-font), serif; }",
		"a { font: var(--font-size) 'Open Sans', var(--my-font); }",
		":root { --my-font: sans-serif; } a { font: var(--font-weight) var(--font-size)/var(--line-height) var(--font-family); }",
	],
	invalid: [
		{
			code: ":root { --my-font: 'Arial'; } a { font-family: var(--my-font); }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 48,
					endLine: 1,
					endColumn: 62,
				},
			],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font); }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 66,
					endLine: 1,
					endColumn: 80,
				},
			],
		},
		{
			code: "a { font-family: 'Arial'; }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: "a { font-family: 'Arial', 'Segoe UI Emoji'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: "a { font-family: var(--my-font), 'Arial'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 41,
				},
			],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: 'Segoe UI', var(--my-font); }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 66,
					endLine: 1,
					endColumn: 92,
				},
			],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font), 'Segoe UI'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 66,
					endLine: 1,
					endColumn: 92,
				},
			],
		},
		{
			code: ":root { --my-font-value: 1.2em 'Arial'; } a { font: var(--my-font-value); }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 53,
					endLine: 1,
					endColumn: 73,
				},
			],
		},
		{
			code: ":root { --my-font-value: 1.2em 'Arial', 'Fira Sans'; } a { font: var(--my-font-value); }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 66,
					endLine: 1,
					endColumn: 86,
				},
			],
		},
		{
			code: "a { font: 1.2em 'Arial'; }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "a { font: 1.2em 'Arial', 'Fira Sans'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 37,
				},
			],
		},
		{
			code: "a { font: italic small-caps bold condensed 16px/2 'Roboto', 'Open Sans'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 72,
				},
			],
		},
		{
			code: "a { font: var(--font-size) 'Open Sans'; }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: "a { font: var(--font-size) 'Roboto', 'Open Sans'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 49,
				},
			],
		},
		{
			code: ":root { --my-font: 'Roboto', 'Open Sans'; } a { font: var(--font-size) 'Open Sans', var(--my-font); }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 55,
					endLine: 1,
					endColumn: 99,
				},
			],
		},
		{
			code: "a { font: var(--font-size) 'Open Sans', var(--my-font), 'Roboto'; }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 65,
				},
			],
		},
		{
			code: ":root { --font-family: 'Roboto'; } a { font: var(--font-weight) var(--font-size)/var(--line-height) var(--font-family); }",
			errors: [
				{
					messageId: "useFallbackFonts",
					line: 1,
					column: 46,
					endLine: 1,
					endColumn: 119,
				},
			],
		},
		{
			code: ":root { --font-family: 'Roboto', 'Open Sans'; } a { font: var(--font-weight) var(--font-size)/var(--line-height) var(--font-family); }",
			errors: [
				{
					messageId: "useGenericFont",
					line: 1,
					column: 59,
					endLine: 1,
					endColumn: 132,
				},
			],
		},
	],
});
