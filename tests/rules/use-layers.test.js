/**
 * @fileoverview Tests for use-layers rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/use-layers.js";
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

ruleTester.run("use-layers", rule, {
	valid: [
		"@layer bar { a { color: red; } }",
		"@layer foo { a { color: red; } }",
		"@import 'foo.css' layer(foo);",
		dedent`
			@media (min-width: 600px) {
				@layer foo {
					a { color: bar }
				}
			}
		`,
		"@LAYER bar { a { color: red; } }",
		"@Layer foo { a { color: red; } }",
		"@IMPORT 'foo.css' layer(foo);",
		dedent`
			@media (min-width: 600px) {
				@LAYER foo {
					a { color: bar }
				}
			}
		`,
		dedent`
			@media (min-width: 600px) {
				@layer foo {
					a { color: bar }
					@layer bar {
						b { color: red; }
					}
				}
			}
		`,
		{
			code: "@layer { a { color: red; } }",
			options: [{ allowUnnamedLayers: true }],
		},
		{
			code: "@LAYER { a { color: red; } }",
			options: [{ allowUnnamedLayers: true }],
		},
		{
			code: "@import 'foo.css' layer;",
			options: [{ allowUnnamedLayers: true }],
		},
		{
			code: "@import 'foo.css';",
			options: [{ requireImportLayers: false }],
		},
		{
			code: "@IMPORT 'foo.css';",
			options: [{ requireImportLayers: false }],
		},
		{
			code: "@layer foo.bar { a { color: red; } }",
			options: [{ layerNamePattern: "^(foo|bar)$" }],
		},
		{
			code: "@LAYER foo.bar { a { color: red; } }",
			options: [{ layerNamePattern: "^(foo|bar)$" }],
		},
		{
			code: "@layer foo.bar.baz { a { color: red; } }",
			options: [{ layerNamePattern: "^(foo|bar|baz)$" }],
		},
		{
			code: "@import 'foo.css' layer(foo.bar);",
			options: [{ layerNamePattern: "^(foo|bar)$" }],
		},
		{
			code: "@layer foo, bar.baz, baz.qux;",
			options: [{ layerNamePattern: "^(foo|bar|baz|qux)$" }],
		},
	],
	invalid: [
		{
			code: "a { color: bar }",
			errors: [
				{
					messageId: "missingLayer",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`
				a { color: bar }
				@layer { a { color: red; } }
			`,
			errors: [
				{
					messageId: "missingLayer",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
				{
					messageId: "missingLayerName",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 29,
				},
			],
		},
		{
			code: dedent`
				@layer { a { color: red; } }
				a { color: bar }
			`,
			errors: [
				{
					messageId: "missingLayerName",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "missingLayer",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`
				@LAYER { a { color: red; } }
				a { color: bar }
			`,
			errors: [
				{
					messageId: "missingLayerName",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "missingLayer",
					line: 2,
					column: 1,
					endLine: 2,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`
				@media (min-width: 600px) {
					a { color: bar }
				}
			`,
			errors: [
				{
					messageId: "missingLayer",
					line: 2,
					column: 2,
					endLine: 2,
					endColumn: 18,
				},
			],
		},
		{
			code: dedent`
				@media (min-width: 600px) {
					@layer foo {
						a { color: bar }
						@layer bar {
							b { color: red; }
						}
					}
				}

				p { color: red; }
			`,
			errors: [
				{
					messageId: "missingLayer",
					line: 10,
					column: 1,
					endLine: 10,
					endColumn: 18,
				},
			],
		},
		{
			code: "@import 'foo.css';",
			errors: [
				{
					messageId: "missingImportLayer",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "@IMPORT 'foo.css';",
			errors: [
				{
					messageId: "missingImportLayer",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "@import 'foo.css' layer;",
			errors: [
				{
					messageId: "missingLayerName",
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "@layer foo, baz { a { color: bar } }",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 13,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "@layer foo, bar, baz;",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "@LAYER foo, bar, baz;",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "@import 'foo.css' layer(baz);",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 25,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "@import 'foo.css'",
			errors: [
				{
					messageId: "missingImportLayer",
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "@layer foo.bar { a { color: red; } }",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "@layer foo.baz { a { color: red; } }",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "@layer foo.bar, baz.qux { a { color: red; } }",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 11,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 20,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "qux",
						pattern: "bar",
					},
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 24,
				},
			],
		},
		{
			code: "@import 'style.css' layer(foo.bar);",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 27,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: "@import 'style.css' layer(foo.baz);",
			options: [{ layerNamePattern: "bar" }],
			errors: [
				{
					messageId: "layerNameMismatch",
					data: {
						name: "foo",
						pattern: "bar",
					},
					line: 1,
					column: 27,
					endLine: 1,
					endColumn: 30,
				},
				{
					messageId: "layerNameMismatch",
					data: {
						name: "baz",
						pattern: "bar",
					},
					line: 1,
					column: 31,
					endLine: 1,
					endColumn: 34,
				},
			],
		},
	],
});
