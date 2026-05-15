/**
 * @fileoverview Tests for no-invalid-named-grid-areas rule.
 * @author xbinaryx
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-invalid-named-grid-areas.js";
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

ruleTester.run("no-invalid-named-grid-areas", rule, {
	valid: [
		".grid { grid-template-areas: 1fr / auto 1fr auto; }",
		'.grid { grid-template-areas: "a a a" "b b b"; }',
		'.grid { grid-template-areas: " a a a " "b b b"; }',
		'.grid { GRID-TEMPLATE-AREAS: "a a a" "b b b"; }',
		dedent`
        .grid { grid-template-areas: "head head"
                                     "nav  main"
						             "nav  foot"; 
        }`,
		dedent`
        .grid { grid-template-areas: "head      head"
                                     "nav       main"
						             "nav       foot"; 
        }`,
		dedent`
        .grid { grid-template-areas: 
                /* "" */ "head head"
                "nav  main" /* "a b c" */
				"nav  foot" /* "" */;
        }`,
		".grid { grid-template-areas: none; }",
		".grid { grid-template-areas:   none; }",
		".grid { grid-template-areas: NONE; }",
		".grid { grid-template-areas: /*comment*/ none /* comment */; }",
		".grid { grid-template-areas: /*comment*/ NONE /* comment */; }",
		'.grid { grid-template-areas: /* comment "" " */ none; }',
		dedent`
        .grid {
            grid-template-areas: /* "comment" */ none /* "comment " */;
        }`,
		dedent`
        .grid {
			grid-template:
				"a a a" 40px
				"b c c" 40px
				"b c c" 40px / 1fr 1fr 1fr;
		}`,
	],
	invalid: [
		{
			code: 'a { grid-template-areas: "a a a" "b b"; }',
			errors: [
				{
					messageId: "unevenGridArea",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 39,
				},
			],
		},
		{
			code: 'a { grid-template-areas: "a a a" "b b a"; }',
			errors: [
				{
					messageId: "nonRectangularGridArea",
					data: { name: "a" },
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 41,
				},
			],
		},
		{
			code: dedent`
			a { grid-template-areas:
			        "a a"
			        "a ."; 
			}`,
			errors: [
				{
					messageId: "nonRectangularGridArea",
					data: { name: "a" },
					line: 3,
					column: 9,
					endLine: 3,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`
			a { grid-template-areas:
			        ". y y"
			        "y y .";
			}`,
			errors: [
				{
					messageId: "nonRectangularGridArea",
					data: { name: "y" },
					line: 3,
					column: 9,
					endLine: 3,
					endColumn: 16,
				},
			],
		},
		{
			code: 'a { grid-template-areas: "a c a" "c b a"; }',
			errors: [
				{
					messageId: "nonRectangularGridArea",
					data: { name: "a" },
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 41,
				},
				{
					messageId: "nonRectangularGridArea",
					data: { name: "c" },
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 41,
				},
			],
		},
		{
			code: dedent`
            a {
                  grid-template-areas: "header header header header"
                      "main main . sidebar"
                      "footer footer footer header";
            }`,
			errors: [
				{
					messageId: "nonRectangularGridArea",
					data: { name: "header" },
					line: 4,
					column: 11,
					endLine: 4,
					endColumn: 40,
				},
			],
		},
		{
			code: 'a { grid-template-areas: ""; }',
			errors: [
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: 'a { grid-template-areas: /* "comment" */ ""; }',
			errors: [
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 44,
				},
			],
		},
		{
			code: dedent`
            a { grid-template-areas:
                "";
            }`,
			errors: [
				{
					messageId: "emptyGridArea",
					line: 2,
					column: 5,
					endLine: 2,
					endColumn: 7,
				},
			],
		},
		{
			code: 'a { grid-template-areas: "" "" ""; }',
			errors: [
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 28,
				},
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 29,
					endLine: 1,
					endColumn: 31,
				},
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 32,
					endLine: 1,
					endColumn: 34,
				},
			],
		},
		{
			code: dedent`
            a {
                grid-template-areas: /* none */
                     "" /* none */;
            }`,
			errors: [
				{
					messageId: "emptyGridArea",
					line: 3,
					column: 10,
					endLine: 3,
					endColumn: 12,
				},
			],
		},
		{
			code: 'a { GRID-TEMPLATE-AREAS: ""; }',
			errors: [
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 26,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: dedent`
            a {
                grid-template:
                    "a a" 40px
                    "b c c" 40px
                    "b c c" 40px / 1fr 1fr 1fr;
            }`,
			errors: [
				{
					messageId: "unevenGridArea",
					line: 4,
					column: 9,
					endLine: 4,
					endColumn: 16,
				},
				{
					messageId: "unevenGridArea",
					line: 5,
					column: 9,
					endLine: 5,
					endColumn: 16,
				},
			],
		},
		{
			code: 'a { grid: "" 200px "b" min-content; }',
			errors: [
				{
					messageId: "emptyGridArea",
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 13,
				},
			],
		},
	],
});
