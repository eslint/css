/**
 * @fileoverview Tests for no-unknown-animations rule.
 * @author Gaic4o
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-unknown-animations.js";
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

ruleTester.run("no-unknown-animations", rule, {
	valid: [
		"a { color: red; }",
		dedent`
			@keyframes fade-in {
				from { opacity: 0; }
				to { opacity: 1; }
			}
			.a { animation: fade-in 300ms ease; }
		`,
		// @keyframes defined after usage
		dedent`
			.a { animation: fade-in 300ms ease; }
			@keyframes fade-in {
				from { opacity: 0; }
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		// multiple animations
		dedent`
			.a { animation: fade-in 300ms ease, slide-up 1s infinite; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
			@keyframes slide-up {
				to { transform: translateY(0); }
			}
		`,
		dedent`
			.a { animation-name: fade-in, slide-up; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
			@keyframes slide-up {
				to { transform: translateY(0); }
			}
		`,
		// vendor-prefixed @keyframes
		dedent`
			.a { animation-name: fade-in; }
			@-webkit-keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@-moz-keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@-o-keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@KEYFRAMES fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@-WEBKIT-KEYFRAMES fade-in {
				to { opacity: 1; }
			}
		`,
		// quoted and unquoted names refer to the same animation
		dedent`
			.a { animation-name: "fade-in"; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in; }
			@keyframes "fade-in" {
				to { opacity: 1; }
			}
		`,
		// case-insensitive properties
		dedent`
			.a { ANIMATION-NAME: fade-in; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		// @keyframes inside a conditional at-rule
		dedent`
			.a { animation-name: fade-in; }
			@media (prefers-reduced-motion: no-preference) {
				@keyframes fade-in {
					to { opacity: 1; }
				}
			}
		`,
		// usage inside nested rules and at-rules
		dedent`
			.a {
				.b { animation-name: fade-in; }
			}
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		dedent`
			@media (min-width: 100px) {
				.a { animation: fade-in 1s; }
			}
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		// declarations directly inside a nested at-rule
		dedent`
			.a {
				@media (min-width: 100px) {
					animation-name: fade-in;
				}
			}
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		// `none` as a string is a valid animation name
		dedent`
			.a { animation-name: "none"; }
			@keyframes "none" {
				to { opacity: 1; }
			}
		`,
		dedent`
			.a { animation-name: fade-in !important; }
			@keyframes fade-in {
				to { opacity: 1; }
			}
		`,
		// keywords are not animation names
		".a { animation: none; }",
		".a { animation-name: none; }",
		".a { animation-name: none, none; }",
		".a { animation-name: inherit; }",
		".a { animation-name: INHERIT; }",
		".a { animation-name: initial; }",
		".a { animation-name: unset; }",
		".a { animation-name: revert; }",
		".a { animation-name: revert-layer; }",
		".a { animation: 2s ease-in 1s infinite alternate; }",
		// dynamic values can't be statically analyzed
		".a { animation: var(--anim) 1s; }",
		".a { animation-name: var(--anim-name); }",
		// invalid values are reported by no-invalid-properties
		".a { animation-name: 100px; }",
		".a { animation-name: (); }",
		// animation names are extracted only from animation and animation-name
		".a { --animation-name: fade-in; }",
		".a { transition-property: fade-in; }",
		".a { -webkit-animation-name: fade-in; }",
		// feature queries don't use animations
		"@supports (animation-name: fade-in) { .a { color: red; } }",
	],
	invalid: [
		{
			code: ".a { animation-name: fade-in !important; }",
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: '.a { animation-name: "none"; }',
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "none" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: ".a { animation-name: /* c */ fade-in; }",
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 37,
				},
			],
		},
		{
			code: ".a { animation-name: fade-in, fade-in; }",
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 29,
				},
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 31,
					endLine: 1,
					endColumn: 38,
				},
			],
		},
		{
			code: ".a { animation-name: fade-in; }",
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: dedent`
				.card { animation: fade-in 300ms ease; }
				.button { animation-name: slide-up; }
				@keyframes fade-out {
					from { opacity: 1; }
					to { opacity: 0; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 27,
				},
				{
					messageId: "unknownAnimation",
					data: { name: "slide-up" },
					line: 2,
					column: 27,
					endLine: 2,
					endColumn: 35,
				},
			],
		},
		{
			code: dedent`
				.a { animation: fade-in 300ms ease, slide-up 1s infinite; }
				@keyframes fade-in {
					to { opacity: 1; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "slide-up" },
					line: 1,
					column: 37,
					endLine: 1,
					endColumn: 45,
				},
			],
		},
		{
			code: dedent`
				.a { animation-name: fade-in, slide-up; }
				@keyframes slide-up {
					to { transform: translateY(0); }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		// animation names are case-sensitive
		{
			code: dedent`
				.a { animation-name: FADE-IN; }
				@keyframes fade-in {
					to { opacity: 1; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "FADE-IN" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 29,
				},
			],
		},
		{
			code: dedent`
				.a { animation-name: "fade-in"; }
				@keyframes fade-out {
					to { opacity: 0; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 1,
					column: 22,
					endLine: 1,
					endColumn: 31,
				},
			],
		},
		{
			code: dedent`
				@media (min-width: 100px) {
					.a { animation: fade-in 1s; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 2,
					column: 18,
					endLine: 2,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`
				.a {
					@media (min-width: 100px) {
						animation-name: fade-in;
					}
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 3,
					column: 19,
					endLine: 3,
					endColumn: 26,
				},
			],
		},
		{
			code: dedent`
				.a {
					.b { animation-name: fade-in; }
				}
			`,
			errors: [
				{
					messageId: "unknownAnimation",
					data: { name: "fade-in" },
					line: 2,
					column: 23,
					endLine: 2,
					endColumn: 30,
				},
			],
		},
	],
});
