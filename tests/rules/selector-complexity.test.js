/**
 * @fileoverview Tests for selector-complexity rule
 * @author Tanuj Kanti
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/selector-complexity.js";
import css from "../../src/index.js";
import { RuleTester } from "eslint";
// import dedent from "dedent";

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	plugins: {
		css,
	},
	language: "css/css",
});

ruleTester.run("selector-complexity", rule, {
	valid: [
		"#parent #child {}",
		{
			code: "#id {}",
			options: [{ maxIds: 1 }],
		},
		{
			code: "a:hover {}",
			options: [{ disallowPseudoClasses: ["active"] }],
		},
		{
			code: "[class*='foo'] {}",
			options: [{ disallowAttributeMatchers: ["="] }],
		},
	],
	invalid: [
		{
			code: "#parent #child {}",
			options: [{ maxIds: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "id",
						limit: 1,
					},
				},
			],
		},
		{
			code: "a:hover {}",
			options: [{ disallowPseudoClasses: ["hover"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "hover",
						selector: "pseudo-class",
					},
				},
			],
		},
	],
});
