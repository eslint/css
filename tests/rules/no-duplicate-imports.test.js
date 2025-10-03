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
		"@IMPORT url('x.css');",
		"@imPort url('x.css'); @IMport url('y.css');",
		"@IMPORT 'x.css'; @import url('y.css'); @IMport 'z.css';",
	],
	invalid: [
		{
			code: "@import url('x.css');\n@import url('x.css');",
			output: "@import url('x.css');\n",
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
			code: "@import url('x.css');@import url('x.css');",
			output: "@import url('x.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: "@import url('x.css');@import url('x.css');@import url('y.css')",
			output: "@import url('x.css');@import url('y.css')",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: "@import url('x.css');\n@import 'x.css';",
			output: "@import url('x.css');\n",
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
			output: "@import url('x.css');\n@import 'x.css';",
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
			output: "@import url('x.css');\n@import url('y.css');\n",
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
		{
			code: "@import url('a.css');\n@import url('b.css');\n@import url('c.css');\n@import url('a.css');\n@import url('d.css');",
			output: "@import url('a.css');\n@import url('b.css');\n@import url('c.css');\n@import url('d.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 22,
				},
			],
		},
		{
			code: "@import url('a.css');\n@import url('b.css');\n/* comment */\n@import 'a.css';",
			output: "@import url('a.css');\n@import url('b.css');\n/* comment */\n",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 17,
				},
			],
		},
		{
			code: "@IMPORT url('x.css');\n@IMPORT url('x.css');",
			output: "@IMPORT url('x.css');\n",
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
			code: "@IMport url('x.css');@IMPORT url('x.css');",
			output: "@IMport url('x.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: "@IMPORT url('x.css');@IMPORT url('x.css');@IMPORT url('y.css')",
			output: "@IMPORT url('x.css');@IMPORT url('y.css')",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "x.css" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 43,
				},
			],
		},
		{
			code: "@IMPORT url('x.css');\n@IMPORT 'x.css';\n@IMPORT 'x.css';",
			output: "@IMPORT url('x.css');\n@IMPORT 'x.css';",
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
			code: "@IMPORT url('a.css');\n@import url('b.css');\n@IMPORT url('c.css');\n@import url('a.css');\n@IMPORT url('d.css');",
			output: "@IMPORT url('a.css');\n@import url('b.css');\n@IMPORT url('c.css');\n@IMPORT url('d.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 4,
					column: 1,
					endLine: 4,
					endColumn: 22,
				},
			],
		},
		{
			code: "@import url('a.css');\r\n@import url('a.css');\r\n@import url('b.css');",
			output: "@import url('a.css');\r\n@import url('b.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
		{
			code: "@import url('a.css');\r@import url('a.css');\r@import url('b.css');",
			output: "@import url('a.css');\r@import url('b.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
		{
			code: "@import url('a.css');\f@import url('a.css');\f@import url('b.css');",
			output: "@import url('a.css');\f@import url('b.css');",
			errors: [
				{
					messageId: "duplicateImport",
					data: { url: "a.css" },
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 22,
				},
			],
		},
	],
});
