/**
 * @fileoverview Tests for no-duplicate-keyframe-selectors rule.
 * @author Nitin Kumar
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-duplicate-keyframe-selectors.js";
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

ruleTester.run("no-duplicate-keyframe-selectors", rule, {
	valid: [
		dedent`@keyframes test {
            from { opacity: 0; }
            to { opacity: 1; }
        }`,
		dedent`@-webkit-keyframes test {
            from { opacity: 0; }
            to { opacity: 1; }
        }`,
		dedent`@-moz-keyframes test {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }`,
		dedent`@-o-keyframes test {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }`,
		dedent`@keyframes test {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }`,
		dedent`@keyframes test {
            0% { opacity: 0; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }`,
		dedent`@keyframes test {
            from { opacity: 0; }
            50% { opacity: 0.5; }
            to { opacity: 1; }
        }`,
		dedent`@keyframes test {
        }`,
		dedent`@keyframes test {
            0% { opacity: 0; }
        }`,
		dedent`@keyframes test {
            0% { opacity: 0; }
            0.0% { opacity: 1; }
        }`,
		dedent`@KEYFRAMES test {
			from { opacity: 0; }
			to { opacity: 1; }
		}`,
		dedent`@KeYFrames test {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }`,
		dedent`@Keyframes test {
            from { opacity: 0; }
            50% { opacity: 0.5; }
            to { opacity: 1; }
        }`,
		dedent`@keyframes test {
            entry 0% { opacity: 0; }
            entry 100% { opacity: 1; }
            exit 0% { opacity: 1; }
            exit 100% { opacity: 0; }
        }`,
	],
	invalid: [
		{
			code: dedent`@keyframes test {
                0% { opacity: 0; }
                0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@-webkit-keyframes test {
                0% { opacity: 0; }
                0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@-moz-keyframes test {
                0% { opacity: 0; }
                0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@-o-keyframes test {
                0% { opacity: 0; }
                0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                0% { opacity: 0; }
                10.5% { opacity: 0.15; }
                10.5% { opacity: 0.25; }
                100% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "10.5%" },
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 10,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                from { opacity: 0; }
                from { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "from" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                from { opacity: 0; }
                From { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "from" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                from { opacity: 0; }
                FROM { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "from" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                from { opacity: 0; }
                to { opacity: 1; }
                to { opacity: 2; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "to" },
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                from { opacity: 0; }
                to { opacity: 1; }
                TO { opacity: 2; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "to" },
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                0% { opacity: 0; }
                50% { opacity: 0.5; }
                50% { opacity: 0.75; }
                100% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "50%" },
					line: 4,
					column: 5,
					endLine: 4,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                0% {
                    opacity: 0;
                }

                0% {
                    opacity: 1;
                }

                50% {
                    opacity: 0.5;
                }

                50% {
                    opacity: 0.75;
                }

                50% {
                    opacity: 0.5;
                }

            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 6,
					column: 5,
					endLine: 6,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "50%" },
					line: 14,
					column: 5,
					endLine: 14,
					endColumn: 8,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "50%" },
					line: 18,
					column: 5,
					endLine: 18,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                /* Start */
                0% { opacity: 0; }
                /* Middle */
                0% { opacity: 1; }
                /* End */
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 5,
					column: 5,
					endLine: 5,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@KEYFRAMES test {
                0% { opacity: 0; }
                0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
			],
		},
		{
			code: dedent`@Keyframes test {
                0% {
                    opacity: 0;
                }

                0% {
                    opacity: 1;
                }

                50% {
                    opacity: 0.5;
                }

                50% {
                    opacity: 0.75;
                }

                50% {
                    opacity: 0.5;
                }

            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 6,
					column: 5,
					endLine: 6,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "50%" },
					line: 14,
					column: 5,
					endLine: 14,
					endColumn: 8,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "50%" },
					line: 18,
					column: 5,
					endLine: 18,
					endColumn: 8,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                entry 0% { opacity: 0; }
                entry 0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "entry 0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                entry 0% { opacity: 0; }
                entry  0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "entry 0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 14,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                exit 100% { opacity: 0; }
                exit /* comment */ 100% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "exit 100%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 28,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                ENTRY 0% { opacity: 0; }
                entry 0% { opacity: 1; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "entry 0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 13,
				},
			],
		},
		{
			code: dedent`@keyframes test {
			    from { opacity: 0; }
			    0% { opacity: 0.25; }
			    to { opacity: 1; }
			    100% { opacity: 0.75; }
			}`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "100%" },
					line: 5,
					column: 5,
					endLine: 5,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                FROM { opacity: 0; }
                0% { opacity: 0.25; }
                To { opacity: 1; }
                100% { opacity: 0.75; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "0%" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "100%" },
					line: 5,
					column: 5,
					endLine: 5,
					endColumn: 9,
				},
			],
		},
		{
			code: dedent`@keyframes test {
                0% { opacity: 0; }
                From { opacity: 0.25; }
                100% { opacity: 1; }
                TO { opacity: 0.75; }
            }`,
			errors: [
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "from" },
					line: 3,
					column: 5,
					endLine: 3,
					endColumn: 9,
				},
				{
					messageId: "duplicateKeyframeSelector",
					data: { selector: "to" },
					line: 5,
					column: 5,
					endLine: 5,
					endColumn: 7,
				},
			],
		},
	],
});
