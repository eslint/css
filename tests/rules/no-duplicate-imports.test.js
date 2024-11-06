/**
 * @fileoverview Tests for no-duplicate-imports rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-imports.js";
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

ruleTester.run("no-duplicate-imports", rule, {
	valid: [
		"@import url('x.css');",
		"@import url('x.css'); @import url('y.css');",
		"@import 'x.css'; @import url('y.css'); @import 'z.css';",
	],
	invalid: [
		{
			code: "@import url('x.css');\n@import url('x.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
		{
			code: "@import url('x.css');\n@import 'x.css';",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 17,
				},
			],
		},
		{
			code: "@import url('x.css');\n@import 'x.css';\n@import 'x.css';",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 17,
				},
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 17,
				},
			],
		},
		{
			code: "@import url('x.css');\n@import 'x.css';\n@import url('y.css');\n@import 'y.css';",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 17,
				},
				{
					messageId: "duplicateImport",
					data: { url: "y.css" },
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 17,
				},
			],
		},
	],
});
