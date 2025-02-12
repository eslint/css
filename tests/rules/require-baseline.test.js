/**
 * @fileoverview Tests for baseline rule.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/require-baseline.js";
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

ruleTester.run("require-baseline", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
		"body { padding: 0; }",
		"::before { content: attr(foo); }",
		"a { color: red; -moz-transition: bar }",
		"@font-face { font-weight: 100 400 }",
		"@media (min-width: 800px) { a { color: red; } }",
		"@supports (accent-color: auto) { a { accent-color: auto; } }",
		"@supports (accent-color: red) { a { accent-color: red; } }",
		"@supports (accent-color: auto) { a { accent-color: red; } }",
		"@supports (clip-path: fill-box) { a { clip-path: fill-box; } }",
		`@supports (accent-color: auto) and (backdrop-filter: auto) {
			a { accent-color: auto; background-filter: auto }
		}`,
		`@supports (accent-color: auto) {
			@supports (backdrop-filter: auto) {
				a { accent-color: auto; background-filter: auto }
			}
		}`,
		`@supports (accent-color: auto) {
			@supports (accent-color: auto) {
				a { accent-color: auto; }
			}
			a { accent-color: auto; }
		}`,
		`@supports (width: abs(20% - 100px)) {
			a { width: abs(20% - 100px); }
		}`,
		{
			code: `@property --foo {
				syntax: "*";
				inherits: false;
			}`,
			options: [{ available: "newly" }],
		},
		{
			code: "a { backdrop-filter: auto }",
			options: [{ available: "newly" }],
		},
		{
			code: "p { margin: .; }",
			languageOptions: {
				tolerant: true,
			},
		},
	],
	invalid: [
		{
			code: "a { accent-color: bar; backdrop-filter: auto }",
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "widely",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 17,
				},
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: "a { accent-color: bar; backdrop-filter: auto }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "newly",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: `@property --foo {
				syntax: "*";
				inherits: false;
			}
			@media (min-width: 800px) {
				a { color: red; }
			}`,
			options: [{ available: "widely" }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "property",
						availability: "widely",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "@container (min-width: 800px) { a { color: red; } }",
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "container",
						availability: "widely",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "@view-transition { from-view: a; to-view: b; }\n@container (min-width: 800px) { a { color: red; } }",
			options: [{ available: "newly" }],
			errors: [
				{
					messageId: "notBaselineAtRule",
					data: {
						atRule: "view-transition",
						availability: "newly",
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: dedent`@supports (accent-color: auto) {
				@supports (backdrop-filter: auto) {
					a { accent-color: red; }
				}
				
				a { backdrop-filter: auto; }
			}`,
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "backdrop-filter",
						availability: "widely",
					},
					line: 6,
					column: 6,
					endLine: 6,
					endColumn: 21,
				},
			],
		},
		{
			code: "@supports (clip-path: fill-box) { a { clip-path: stroke-box; } }",
			errors: [
				{
					messageId: "notBaselinePropertyValue",
					data: {
						property: "clip-path",
						value: "stroke-box",
						availability: "widely",
					},
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 60,
				},
			],
		},
		{
			code: "@supports (accent-color: auto) { a { accent-color: abs(20% - 10px); } }",
			errors: [
				{
					messageId: "notBaselineType",
					data: {
						type: "abs",
						availability: "widely",
					},
					line: 1,
					column: 52,
					endLine: 1,
					endColumn: 67,
				},
			],
		},
		{
			code: "@supports not (accent-color: auto) { a { accent-color: auto } }",
			errors: [
				{
					messageId: "notBaselineProperty",
					data: {
						property: "accent-color",
						availability: "widely",
					},
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 54,
				},
			],
		},
		{
			code: "a { width: abs(20% - 100px); }",
			errors: [
				{
					messageId: "notBaselineType",
					data: {
						type: "abs",
						availability: "widely",
					},
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
	],
});
