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
					line: 6,
					column: 5,
					endLine: 6,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					line: 14,
					column: 5,
					endLine: 14,
					endColumn: 8,
				},
				{
					messageId: "duplicateKeyframeSelector",
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
					line: 6,
					column: 5,
					endLine: 6,
					endColumn: 7,
				},
				{
					messageId: "duplicateKeyframeSelector",
					line: 14,
					column: 5,
					endLine: 14,
					endColumn: 8,
				},
				{
					messageId: "duplicateKeyframeSelector",
					line: 18,
					column: 5,
					endLine: 18,
					endColumn: 8,
				},
			],
		},
	],
});
