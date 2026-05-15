/**
 * @fileoverview Tests for no-unmatchable-selectors rule.
 * @author TKDev7
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/no-unmatchable-selectors.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: { css },
	language: "css/css",
});

ruleTester.run("no-unmatchable-selectors", rule, {
	valid: [
		"li:nth-child(1) {}",
		"li:nth-child(n) {}",
		"li:nth-child(-n+2) {}",
		"li:nth-child(-2n+1) {}",
		"li:nth-child(0n+1) {}",
		"li:nth-child(2n) {}",
		"li:nth-child(2n+0) {}",
		"li:nth-child(2n-0) {}",
		"li:nth-child(2n+2) {}",
		"li:nth-child(1 of a) {}",
		"li:nth-last-child(1) {}",
		"li:nth-of-type(1) {}",
		"li:nth-last-of-type(1) {}",
		"li:nth-child(odd) {}",
		"li:nth-child(even) {}",
	],
	invalid: [
		{
			code: "li:nth-child(0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "li:nth-child(0n) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0n)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "li:nth-child(+0n) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(+0n)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "li:nth-child(-0n) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-0n)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "li:nth-child(0n+0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0n+0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "li:nth-child(0n-0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0n-0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "li:nth-child(-0n-0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-0n-0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "li:nth-child(0n-2) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0n-2)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 19,
				},
			],
		},
		{
			code: "li:nth-child(-n) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-n)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "li:nth-child(-2n) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-2n)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "li:nth-child(-3n+0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-3n+0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 20,
				},
			],
		},
		{
			code: "li:nth-child(-1) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(-1)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 17,
				},
			],
		},
		{
			code: "li:nth-child(0 of a) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0 of a)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "li:nth-last-child(0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-last-child(0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "li:nth-of-type(0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-of-type(0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "li:nth-last-of-type(0) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-last-of-type(0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "li:nth-child(0), li:nth-child(1) {}",
			errors: [
				{
					messageId: "unmatchableSelector",
					data: { selector: ":nth-child(0)" },
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
	],
});
