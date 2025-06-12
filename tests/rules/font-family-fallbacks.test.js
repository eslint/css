import rule from "../../src/rules/font-family-fallbacks.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ plugins: { css }, language: "css/css" });

ruleTester.run("font-family-fallbacks", rule, {
	valid: [
		":root { --my-font: 'Arial', sans-serif; } a { font-family: var(--my-font); }",
	],
	invalid: [
		{
			code: ":root { --my-font: 'Arial'; } a { font-family: var(--my-font); }",
			errors: [{ messageId: "useFallbackFonts" }],
		},
	],
});
