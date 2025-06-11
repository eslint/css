/**
 * @fileoverview Tests for no-invalid-at-rule-placement rule.
 * @author thecalamiity
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-at-rule-placement.js";
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

ruleTester.run("no-invalid-at-rule-placement", rule, {
	valid: [
		'@charset "utf-8";',
		dedent`
            @charset "utf-8";
            a { color: red; }`,
		dedent`
            @charset "utf-8";
            /* comment */
            a { color: red; }`,
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
            @charset "utf-8";
            @import 'foo.css';`,
		dedent`
            @layer base;
            @import 'foo.css';`,
		dedent`
            @import 'foo.css';
            @import 'bar.css';`,
		dedent`
            @charset 'utf-8';
            @LAYER base;
            @imPORT 'foo.css';
            @import 'bar.css';`,
		dedent`
            @import 'foo.css';
            a { color: red; }`,
		dedent`
            @charset "utf-8";
            @layer base;
            @import 'foo.css';
            a { color: red; }`,
	],
	invalid: [
		{
			code: dedent`
                /* comment */
                @charset "utf-8";`,
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
                @import 'foo.css';
                @charset "utf-8";`,
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
                @layer base;
                @charset "utf-8";`,
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
                a { color: red; }
                @charset "utf-8";`,
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
		{
			code: ' @charset "utf-8";',
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
                @charset "utf-8";
                @charset "utf-8";`,
			errors: [
				{
					messageId: "invalidCharsetPlacement",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
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
                @layer base { }
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
