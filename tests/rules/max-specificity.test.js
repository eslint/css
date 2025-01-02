/**
 * @fileoverview Tests for max-specificity rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/max-specificity.js";
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

ruleTester.run("max-specificity", rule, {
	valid: [
		{
			code: "a { color: red; }",
			options: [{ a: 0, b: 1, c: 0 }],
		},
	],
	invalid: [
		{
			code: "a { color: bar }",
			options: [{ a: 0, b: 0, c: 0 }],
			errors: [
				{
					messageId: "unexpectedSpecificity",
					data: {
						actual: "0,0,1",
						expected: "0,0,0",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 2,
				},
			],
		},
	],
});
