/**
 * @fileoverview Tests for no-invalid-import-placement rule.
 * @author thecalamiity
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-import-placement.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";
import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		css,
	},
	language: "css/css",
});

ruleTester.run("no-invalid-import-placement", rule, {
	valid: [
		"@import 'foo.css';",
		"@import url('foo.css');",
		"@import 'foo.css' screen;",
		"@import url('foo.css') supports(display: grid) screen and (max-width: 400px);",
		"@import 'foo.css' layer;",
		"@import 'foo.css' layer(base);",
		dedent`
            /* comment */
            @import 'foo.css';`,
		dedent`
            @charset 'utf-8';
            @import 'foo.css';`,
		dedent`
            @layer base;
            @import 'foo.css';`,
		dedent`
            @import 'foo.css';
            @import 'bar.css';`,
		dedent`
            @CHARSET 'utf-8';
            @LAYER base;
            @imPORT 'foo.css';
            @import 'bar.css';`,
		dedent`
            @import 'foo.css';
            a { color: red; }`,
		dedent`
            @charset 'UTF-8';
            @layer base;
            @import 'foo.css';
            a { color: red; }`,
	],
	invalid: [
		{
			code: dedent`
                a { color: red; }
                @import 'foo.css';`,
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
                @media screen { }
                @import url('foo.css');`,
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 24,
				},
			],
		},
		{
			code: dedent`
                @media print { }
                @imPort URl('foo.css');`,
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 24,
				},
			],
		},
		{
			code: dedent`
                @import 'foo.css';
				a {}
				@import 'bar.css';`,
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
                a {}
				@import 'foo.css';
				@import 'bar.css';`,
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 19,
				},
				{
					messageId: "invalidImportPlacement",
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
                @custom-rule {}
                @import
                'foo.css';`,
			languageOptions: {
				customSyntax: {
					atrules: {
						"custom-rule": {},
					},
				},
			},
			errors: [
				{
					messageId: "invalidImportPlacement",
					line: 2,
					column: 1,
					endLine: 3,
					endColumn: 11,
				},
			],
		},
	],
});
