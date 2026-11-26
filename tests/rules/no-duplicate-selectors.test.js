/**
 * @fileoverview Tests for no-duplicate-selectors rule.
 * @author Przemysław Zań
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-selectors.js";
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

ruleTester.run("no-duplicate-selectors", rule, {
	valid: [
		"a {} b {}",
		".foo {} .bar {} .foo .bar {} .bar .foo {}",
		"a {} a, b {}",
		"a, b {} a {}",
		"a {} a b {}",
		".foo { .foo {} }",
		"a { b {} } b {}",
		".a { .b {} } .c { .b {} }",
		".a { .b {} } .x { .a .b {} }",
		".a { & .b {} } .b {}",
		"a { & b {} } a c {}",
		".a.b {} .a.c {}",
		":is(.a, .b) {} :is(.a, .c) {}",
		"* {} *|* {}",
		".\\61 b {} .\\61/**/ b {}",
		".\\61 .x {} .\\61/**/ .x {}",
		"::part(a b) {} ::part(ab) {}",

		dedent`
			.foo {}

			@media (min-width: 10px) {
				.foo {}
			}
		`,
		"@media print { a {} } @media screen { a {} }",
		"@media print { a {} } a {}",
		"@supports (display: grid) { a {} } @supports (display: flex) { a {} }",
		"@container (min-width: 1px) { a {} } a {}",
		'@supports (content: "a b") { a {} } @supports (content: "a  b") { a {} }',
		"@layer a { .x {} } @layer b { .x {} }",
		"@layer a { .x {} } .x {}",
		"@layer { .x {} } @layer { .x {} }",
		"@layer a { .x {} } @layer { .x {} }",
		"@media print { @supports (display: grid) { a {} } } @supports (display: grid) { @media print { a {} } }",
		"@scope (.a) { .b {} } @scope (.c) { .b {} }",
		"@scope (.a) { .b {} } .b {}",
		"@scope (.a) { :scope .b {} .b {} }",
		"@scope (.a :hover) { .x {} } @scope (.a:hover) { .x {} }",
		"@scope (.a/**/.b) { .x {} } @scope (.a .b) { .x {} }",
		"@scope (:is(.a) .b) { .x {} } @scope (:is(.a).b) { .x {} }",

		/*
		 * The parser does not support style rules in a nested `@scope` rule yet.
		 * Enable these tests after the following issue is fixed:
		 * https://github.com/eslint/csstree/issues/175
		 */
		// ".a { @scope (.x) { .c {} } } .b { @scope (.x) { .c {} } }",
		// ".a { @scope { .c {} } } .b { @scope { .c {} } }",

		"a { @media print { b {} } } a b {}",

		// A `& {}` rule keeps declarations after nested rules in source order.
		dedent`
			a {
				color: red;

				& {
					color: blue;
				}
			}
		`,
		".a { color: red; .b {} & { color: blue; } }",
		".a { & {} & {} }",
		".a, .b { & {} & {} }",

		"@keyframes test { from {} from {} }",
		"@-webkit-keyframes test { 0% {} 0% {} }",
		"@media print { @keyframes test { to {} to {} } }",

		// Spellings that the rule does not treat as equivalent
		"DIV {} div {}",
		"a:hover {} a:HOVER {}",
		'[type="text"] {} [type=text] {}',
		"a::before {} a:before {}",
		":nth-child(2n+1) {} :nth-child(odd) {}",
		"a:hover::before {} a::before:hover {}",

		// Nested selectors that do not have the same meaning
		".a .b { .c & {} } .c .a .b {}",
		".x .a { :has(> &) {} } :has(> .x .a) {}",
		".a, .b { .c {} } .a .c, .b .c {}",
		"span { div& {} } divspan {}",
		"div { && {} } divdiv {}",
		".x div { && {} } .x divdiv {}",
		".a .b { && {} } .a .b.b {}",
		"div { .a& {} } .adiv {}",
		"a::before { &:hover {} } a::before:hover {}",

		// The rule ignores selector lists that are not valid.
		{
			code: "a||b {} a||b {}",
			languageOptions: {
				tolerant: true,
			},
		},
		{
			code: "a||b { c {} } a||b { c {} }",
			languageOptions: {
				tolerant: true,
			},
		},
	],
	invalid: [
		{
			code: ".foo {} .bar {} .foo {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".foo", line: 1 },
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`
				.foo {
					color: red;
				}

				.foo {
					color: blue;
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".foo", line: 1 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 5,
				},
			],
		},
		{
			code: dedent`
				.foo,
				.bar,
				.foo {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".foo", line: 1 },
					line: 3,
					column: 1,
					endLine: 3,
					endColumn: 5,
				},
			],
		},
		{
			code: "a, b, a, a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 8,
				},
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "a, a {} a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: ":root {} :root {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":root", line: 1 },
					line: 1,
					column: 10,
					endLine: 1,
					endColumn: 15,
				},
			],
		},

		// Equivalent spellings
		{
			code: "a, b {} b, a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "b, a", line: 1 },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "a d, b > c {} b>c, a d {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "b>c, a d", line: 1 },
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "a /* x */ b {} a b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a b", line: 1 },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: dedent`
				.a .b {}
				.a
					.b {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a .b", line: 1 },
					line: 2,
					column: 1,
					endLine: 3,
					endColumn: 4,
				},
			],
		},
		{
			code: dedent`
				:root, :host {}

				:root,
				:host {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":root, :host", line: 1 },
					line: 3,
					column: 1,
					endLine: 4,
					endColumn: 6,
				},
			],
		},
		{
			code: ".a  .b {} .a \n.b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a  .b", line: 1 },
					line: 1,
					column: 11,
					endLine: 2,
					endColumn: 3,
				},
			],
		},
		{
			code: ".a.b {} .b.a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b.a", line: 1 },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
		{
			code: "a.b:hover {} a:hover.b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a:hover.b", line: 1 },
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: ":is(.a, .b) {} :is(.b, .a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":is(.b, .a)", line: 1 },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: ":not(.a, .b) {} :not(.b,.a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":not(.b,.a)", line: 1 },
					line: 1,
					column: 17,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: ":has(> .a, > .b) {} :has(> .b, > .a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":has(> .b, > .a)", line: 1 },
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 37,
				},
			],
		},
		{
			code: ":nth-child(2n+1 of .a, .b) {} :nth-child(2n+1 of .b, .a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":nth-child(2n+1 of .b, .a)", line: 1 },
					line: 1,
					column: 31,
					endLine: 1,
					endColumn: 57,
				},
			],
		},
		{
			code: "::slotted(.a.b) {} ::slotted(.b.a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "::slotted(.b.a)", line: 1 },
					line: 1,
					column: 20,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: '[ type = "text" i ] {} [type="text" i] {}',
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: '[type="text" i]', line: 1 },
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: ":lang(en, fr) {} :lang(en,fr) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":lang(en,fr)", line: 1 },
					line: 1,
					column: 18,
					endLine: 1,
					endColumn: 30,
				},
			],
		},
		{
			code: ":nth-child(2n + 1) {} :nth-child(2n+1) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":nth-child(2n+1)", line: 1 },
					line: 1,
					column: 23,
					endLine: 1,
					endColumn: 39,
				},
			],
		},

		{
			code: dedent`
				@media (min-width: 10px) {
					.foo {}
					.foo {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".foo", line: 2 },
					line: 3,
					column: 2,
					endLine: 3,
					endColumn: 6,
				},
			],
		},
		{
			code: dedent`
				@media print {
					a {}
				}

				@media print {
					a {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 2 },
					line: 6,
					column: 2,
					endLine: 6,
					endColumn: 3,
				},
			],
		},
		{
			code: "@media  print { a {} } @MEDIA print { a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 39,
					endLine: 1,
					endColumn: 40,
				},
			],
		},
		{
			code: "@media (min-width:600px) { a {} } @media ( min-width: 600px ) { a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 65,
					endLine: 1,
					endColumn: 66,
				},
			],
		},
		{
			code: "@media /* x */ print { a {} } @media print { a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 46,
					endLine: 1,
					endColumn: 47,
				},
			],
		},
		{
			code: "@starting-style { .a {} } @starting-style { .a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a", line: 1 },
					line: 1,
					column: 45,
					endLine: 1,
					endColumn: 47,
				},
			],
		},
		{
			code: "@layer x { a {} } @layer x { a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 1 },
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 31,
				},
			],
		},
		{
			code: dedent`
				@supports (display: grid) {
					@media print {
						a {}
					}
				}

				@supports (display:grid) {
					@media print {
						a {}
					}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a", line: 3 },
					line: 9,
					column: 3,
					endLine: 9,
					endColumn: 4,
				},
			],
		},
		{
			code: "@scope (.a) { .b {} .b {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b", line: 1 },
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "@scope (.a) { .b {} & .b {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "& .b", line: 1 },
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 25,
				},
			],
		},
		{
			code: dedent`
				@scope (.a) {
					.b {
						.c {}
					}
				}

				@scope (.a) {
					.b .c {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b .c", line: 3 },
					line: 8,
					column: 2,
					endLine: 8,
					endColumn: 7,
				},
			],
		},

		// Nested selectors that resolve to the same selector
		{
			code: dedent`
				a {
					b {}
				}

				a b {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a b", line: 2 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 4,
				},
			],
		},
		{
			code: dedent`
				a b {}

				a {
					& b {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "& b", line: 1 },
					line: 4,
					column: 2,
					endLine: 4,
					endColumn: 5,
				},
			],
		},
		{
			code: "a { > b {} } a > b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a > b", line: 1 },
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "a { + b {} ~ c {} } a + b {} a ~ c {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a + b", line: 1 },
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 26,
				},
				{
					messageId: "duplicateSelector",
					data: { selector: "a ~ c", line: 1 },
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 35,
				},
			],
		},
		{
			code: ".a { &.b {} } .a.b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a.b", line: 1 },
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: ".a { .b& {} } .a.b {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a.b", line: 1 },
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: ".a { && {} } .a.a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a.a", line: 1 },
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "div { .a& {} } div.a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "div.a", line: 1 },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: ".a { .b & {} } .b .a {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b .a", line: 1 },
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: dedent`
				.a .b {
					&.c {}
				}

				.a .b.c {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a .b.c", line: 2 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
				.a .b {
					.c& {}
				}

				.a .b.c {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a .b.c", line: 2 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`
				.a {
					.b {
						.c {}
					}
				}

				.a .b .c {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a .b .c", line: 3 },
					line: 7,
					column: 1,
					endLine: 7,
					endColumn: 9,
				},
			],
		},
		{
			code: ".a { :not(&) {} } :not(.a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":not(.a)", line: 1 },
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: ".a { :nth-child(2n+1 of &) {} } :nth-child(2n+1 of .a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":nth-child(2n+1 of .a)", line: 1 },
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 55,
				},
			],
		},
		{
			code: ".a .b { :is(& .c) {} } :is(.a .b .c) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":is(.a .b .c)", line: 1 },
					line: 1,
					column: 24,
					endLine: 1,
					endColumn: 37,
				},
			],
		},
		{
			code: ".a { :has(> &) {} } :has(> .a) {}",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":has(> .a)", line: 1 },
					line: 1,
					column: 21,
					endLine: 1,
					endColumn: 31,
				},
			],
		},
		{
			code: dedent`
				.a, .b {
					.c {}
				}

				:is(.a, .b) .c {}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ":is(.a, .b) .c", line: 2 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 15,
				},
			],
		},
		{
			code: dedent`
				.a, .b {
					.c {}
				}

				.b, .a {
					.c {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b, .a", line: 1 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 7,
				},
				{
					messageId: "duplicateSelector",
					data: { selector: ".c", line: 2 },
					line: 6,
					column: 2,
					endLine: 6,
					endColumn: 4,
				},
			],
		},
		{
			code: dedent`
				.a {
					.b {}
				}

				.a {
					.b {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a", line: 1 },
					line: 5,
					column: 1,
					endLine: 5,
					endColumn: 3,
				},
				{
					messageId: "duplicateSelector",
					data: { selector: ".b", line: 2 },
					line: 6,
					column: 2,
					endLine: 6,
					endColumn: 4,
				},
			],
		},
		{
			code: ".a { &, & {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "&", line: 1 },
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: ".a {} .a { & {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a", line: 1 },
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: ".a { & .b, .b {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".b", line: 1 },
					line: 1,
					column: 12,
					endLine: 1,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
				a {
					@media print {
						b {}
					}
				}

				@media print {
					a b {}
				}
			`,
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: "a b", line: 3 },
					line: 8,
					column: 2,
					endLine: 8,
					endColumn: 5,
				},
			],
		},
		{
			code: ".a { @media print { & {} } } @media print { .a {} }",
			errors: [
				{
					messageId: "duplicateSelector",
					data: { selector: ".a", line: 1 },
					line: 1,
					column: 45,
					endLine: 1,
					endColumn: 47,
				},
			],
		},
	],
});
