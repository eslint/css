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
		"a { font-family: sans-serif;; }",
		"a { font-family: 'Arial', 'Segoe UI Emoji', serif; }",
		"a { font-family: 'Arial', var(--my-font); }",
		"a { font-family: 'Arial', var(--my-font), serif; }",
		":root { --my-font: sans-serif; } a { font-family: 'Arial', var(--my-font); }",
		":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font), serif; }",
	],
	invalid: [
		{
			code: ":root { --my-font: 'Arial'; } a { font-family: var(--my-font); }",
			errors: [{ messageId: "useFallbackFonts" }],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font); }",
			errors: [{ messageId: "useGenericFont" }],
		},
		{
			code: "a { font-family: 'Arial'; }",
			errors: [{ messageId: "useFallbackFonts" }],
		},
		{
			code: "a { font-family: 'Arial', 'Segoe UI Emoji'; }",
			errors: [{ messageId: "useGenericFont" }],
		},
		{
			code: "a { font-family: var(--my-font), 'Arial'; }",
			errors: [{ messageId: "useGenericFont" }],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: 'Segoe UI', var(--my-font); }",
			errors: [{ messageId: "useGenericFont" }],
		},
		{
			code: ":root { --my-font: 'Arial', 'Segoe UI Emoji'; } a { font-family: var(--my-font), 'Segoe UI'; }",
			errors: [{ messageId: "useGenericFont" }],
		},
	],
});
