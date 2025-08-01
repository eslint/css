/**
 * @fileoverview Tests for no-important rule.
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-important.js";
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

ruleTester.run("no-important", rule, {
	valid: [
		"a { color: red; }",
		"a { color: red; background-color: blue; }",
		"a { color: red; transition: none; }",
		"body { --custom-property: red; }",
		"body { --custom-property: important; }",
		"body { padding: 0; }",
		"a { color: red; -moz-transition: bar }",
		"@font-face { font-weight: 100 400 }",
		'@property --foo { syntax: "*"; inherits: false; }',
		"a { --my-color: red; color: var(--my-color) }",
		{
			code: "a { my-custom-color: red; }",
			languageOptions: {
				customSyntax: {
					properties: {
						"my-custom-color": "<color>",
					},
				},
			},
		},
		"@keyframes important { from { margin: 1px; } }",
		"@-webkit-keyframes important { from { margin: 1px; } }",
		"@-WEBKIT-KEYFRAMES important { from { margin: 1px; } }",
		"a { color: red /* !important */; }",
		"a { color: /* !important */ red; }",
		"a { color: red; /* !important */ background: blue; }",
	],
	invalid: [
		{
			code: "a { color: red !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: "a { color: red !important }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red }",
						},
					],
				},
			],
		},
		{
			code: "a { color:red!important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 24,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color:red; }",
						},
					],
				},
			],
		},
		{
			code: "a { padding: 10px 20px 30px 40px ! important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 34,
					endLine: 1,
					endColumn: 45,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { padding: 10px 20px 30px 40px; }",
						},
					],
				},
			],
		},
		{
			code: "a { border: 0 !IMPORTANT; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 25,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { border: 0; }",
						},
					],
				},
			],
		},
		{
			code: "a { color: red !important; margin: 0 ! important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 26,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; margin: 0 ! important; }",
						},
					],
				},
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 38,
					endLine: 1,
					endColumn: 49,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red !important; margin: 0; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						! important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 14,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "a { color: red /* comment */ !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 30,
					endLine: 1,
					endColumn: 40,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red /* comment */; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red /* comment */
						!important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red /* comment */;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "a { color: red !/* comment */important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 39,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: "a { color: red ! /* comment */ important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 41,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!/* comment */important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 26,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						! /* comment */ important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 28,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!important;
					margin: 0
						! important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
								margin: 0
									! important;
							}
							`,
						},
					],
				},
				{
					messageId: "unexpectedImportant",
					line: 5,
					column: 3,
					endLine: 5,
					endColumn: 14,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red
									!important;
								margin: 0;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@keyframes important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@-webkit-keyframes important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 61,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@-webkit-keyframes important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@-WEBKIT-KEYFRAMES important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 51,
					endLine: 1,
					endColumn: 61,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@-WEBKIT-KEYFRAMES important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px!important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 42,
					endLine: 1,
					endColumn: 52,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@keyframes important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@keyframes important { from { margin: 1px ! important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 54,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@keyframes important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@kEyFrAmEs important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@kEyFrAmEs important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "@KEYFRAMES important { from { margin: 1px !important; } }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 43,
					endLine: 1,
					endColumn: 53,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "@KEYFRAMES important { from { margin: 1px; } }",
						},
					],
				},
			],
		},
		{
			code: "a { color: red /* !important */ !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 33,
					endLine: 1,
					endColumn: 43,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red /* !important */; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red /* !important */
						!important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 13,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red /* !important */;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "a { color: red !/* !important */important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 42,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: "a { color: red ! /* !important */ important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 44,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						!/* !important */important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 29,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red
						! /* !important */ important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 3,
					endLine: 3,
					endColumn: 31,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "a { color: red /* !important */ /* !important */ !important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 50,
					endLine: 1,
					endColumn: 60,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red /* !important */ /* !important */; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red /* !important */ /* !important
					*/ !important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 15,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red /* !important */ /* !important
								*/;
							}
							`,
						},
					],
				},
			],
		},
		{
			code: "a { color: red ! /* !important */ /* another comment */ /* a third comment */important; }",
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 1,
					column: 16,
					endLine: 1,
					endColumn: 87,
					suggestions: [
						{
							messageId: "removeImportant",
							output: "a { color: red; }",
						},
					],
				},
			],
		},
		{
			code: dedent`
				a {
					color: red ! /* !important */ /* another
					comment */ /* a third comment */important;
				}
			`,
			errors: [
				{
					messageId: "unexpectedImportant",
					line: 2,
					column: 13,
					endLine: 3,
					endColumn: 43,
					suggestions: [
						{
							messageId: "removeImportant",
							output: dedent`
							a {
								color: red;
							}
							`,
						},
					],
				},
			],
		},
	],
});
