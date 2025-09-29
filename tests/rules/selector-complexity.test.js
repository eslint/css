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
		".foo .bar .baz {}",
		"ul li a {}",
		"a:hover {}",
		"span::before {}",
		"[class^='foo'] {}",
		"* * {}",
		"a.foo b.bar c.baz {}",
		"a + b > c ~ d {}",
		{
			code: "#id {}",
			options: [{ maxIds: 1 }],
		},
		{
			code: "#foo, #bar {}",
			options: [{ maxIds: 1 }],
		},
		{
			code: "button#foo {}",
			options: [{ maxIds: 1 }],
		},
		{
			code: "#foo:not(#bar) {}",
			options: [{ maxIds: 1 }],
		},
		{
			code: ".foo .bar {}",
			options: [{ maxClasses: 2 }],
		},
		{
			code: "a.foo b.bar {}",
			options: [{ maxClasses: 2 }],
		},
		{
			code: ".foo .bar, .baz{}",
			options: [{ maxClasses: 2 }],
		},
		{
			code: ".foo .bar:not(.baz) {}",
			options: [{ maxClasses: 2 }],
		},
		{
			code: "ul li a {}",
			options: [{ maxTypes: 3 }],
		},
		{
			code: "button.foo a {}",
			options: [{ maxTypes: 2 }],
		},
		{
			code: ".foo div a {}",
			options: [{ maxTypes: 2 }],
		},
		{
			code: "button, div a {}",
			options: [{ maxTypes: 2 }],
		},
		{
			code: "div * a {}",
			options: [{ maxTypes: 2 }],
		},
		{
			code: "* * {}",
			options: [{ maxTypes: 1 }],
		},
		{
			code: "[class*='foo'] {}",
			options: [{ maxAttributes: 1 }],
		},
		{
			code: "input:not([name='foo']) {}",
			options: [{ maxAttributes: 1 }],
		},
		{
			code: "[id*='foo'], [name*='bar'] {}",
			options: [{ maxAttributes: 1 }],
		},
		{
			code: "a:hover {}",
			options: [{ maxPseudoClasses: 1 }],
		},
		{
			code: "a:hover, a:focus {}",
			options: [{ maxPseudoClasses: 1 }],
		},
		{
			code: "* {}",
			options: [{ maxUniversals: 1 }],
		},
		{
			code: "div p a {}",
			options: [{ maxUniversals: 1 }],
		},
		{
			code: "div .foo {}",
			options: [{ maxCompounds: 2 }],
		},
		{
			code: "div [class*='foo'] {}",
			options: [{ maxCompounds: 2 }],
		},
		{
			code: "button:hover + a {}",
			options: [{ maxCompounds: 2 }],
		},
		{
			code: "button:hover + a, #foo {}",
			options: [{ maxCompounds: 2 }],
		},
		{
			code: "div > p {}",
			options: [{ maxCombinators: 1 }],
		},
		{
			code: "button + a {}",
			options: [{ maxCombinators: 1 }],
		},
		{
			code: "button + a, h1 > a {}",
			options: [{ maxCombinators: 1 }],
		},
		{
			code: "button.foo + a {}",
			options: [{ disallowCombinators: [">"] }],
		},
		{
			code: "div > h1 {}",
			options: [{ disallowCombinators: ["+"] }],
		},
		{
			code: "a:not(#foo) {}",
			options: [{ disallowPseudoClasses: ["hover"] }],
		},
		{
			code: "a:hover {}",
			options: [{ disallowPseudoClasses: ["active"] }],
		},
		{
			code: ".foo::before {}",
			options: [{ disallowPseudoElements: ["placeholder"] }],
		},
		{
			code: ".foo::before, .bar::after {}",
			options: [{ disallowPseudoElements: ["marker"] }],
		},
		{
			code: "[name='foo'] {}",
			options: [{ disallowAttributes: ["class"] }],
		},
		{
			code: "[type='foo'][name='bar'] {}",
			options: [{ disallowAttributes: ["class"] }],
		},
		{
			code: "img[src='foo'] {}",
			options: [{ disallowAttributes: ["alt"] }],
		},
		{
			code: "[class*='foo'] {}",
			options: [{ disallowAttributeMatchers: ["="] }],
		},
		{
			code: ".foo[class^='foo'] > .bar[name*='bar'] {}",
			options: [{ disallowAttributeMatchers: ["=", "$="] }],
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
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "#foo, #bar #baz {}",
			options: [{ maxIds: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "id",
						limit: 1,
					},
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "a#baz {}",
			options: [{ maxIds: 0 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "id",
						limit: 0,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 6,
				},
			],
		},
		{
			code: ".foo .bar .baz {}",
			options: [{ maxClasses: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "class",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "a.foo b.bar c.baz {}",
			options: [{ maxClasses: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "class",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 18,
				},
			],
		},
		{
			code: "div p a {}",
			options: [{ maxTypes: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "type",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "ul.foo li a.bar {}",
			options: [{ maxTypes: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "type",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 16,
				},
			],
		},
		{
			code: "div > p > a {}",
			options: [{ maxTypes: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "type",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: "[class*='foo'][name*='bar'] {}",
			options: [{ maxAttributes: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "attribute",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 28,
				},
			],
		},
		{
			code: "[type='number'][disabled] {}",
			options: [{ maxAttributes: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "attribute",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 26,
				},
			],
		},
		{
			code: "input:not([type='number'][disabled]) {}",
			options: [{ maxAttributes: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "attribute",
						limit: 1,
					},
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 36,
				},
			],
		},
		{
			code: ".foo:first-child:hover {}",
			options: [{ maxPseudoClasses: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "pseudo-class",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 23,
				},
			],
		},
		{
			code: "ul li:nth-child(2) a:hover {}",
			options: [{ maxPseudoClasses: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "pseudo-class",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 27,
				},
			],
		},
		{
			code: "* * {}",
			options: [{ maxUniversals: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "universal",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 4,
				},
			],
		},
		{
			code: "div.foo [class*='bar'] > a:hover {}",
			options: [{ maxCompounds: 2 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "compound",
						limit: 2,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 33,
				},
			],
		},
		{
			code: "div > p > a {}",
			options: [{ maxCombinators: 1 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "combinator",
						limit: 1,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 12,
				},
			],
		},
		{
			code: ".foo .bar {}",
			options: [{ maxCombinators: 0 }],
			errors: [
				{
					messageId: "maxSelectors",
					data: {
						selector: "combinator",
						limit: 0,
					},
					line: 1,
					column: 1,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "div.foo > p {}",
			options: [{ disallowCombinators: [">"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: ">",
						selector: "combinator",
					},
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 10,
				},
			],
		},
		{
			code: "div.foo > h1 + h2 {}",
			options: [{ disallowCombinators: [">", "+"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: ">",
						selector: "combinator",
					},
					line: 1,
					column: 9,
					endLine: 1,
					endColumn: 10,
				},
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "+",
						selector: "combinator",
					},
					line: 1,
					column: 14,
					endLine: 1,
					endColumn: 15,
				},
			],
		},
		{
			code: "div h1 {}",
			options: [{ disallowCombinators: [" "] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: " ",
						selector: "combinator",
					},
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 5,
				},
			],
		},
		{
			code: "foo bar baz {}",
			options: [{ disallowCombinators: [" "] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: " ",
						selector: "combinator",
					},
					line: 1,
					column: 4,
					endLine: 1,
					endColumn: 5,
				},
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: " ",
						selector: "combinator",
					},
					line: 1,
					column: 8,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "foo + bar + baz {}",
			options: [{ disallowCombinators: ["+"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "+",
						selector: "combinator",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 6,
				},
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "+",
						selector: "combinator",
					},
					line: 1,
					column: 11,
					endLine: 1,
					endColumn: 12,
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
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "li:first-child:hover {}",
			options: [{ disallowPseudoClasses: ["hover", "first-child"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "first-child",
						selector: "pseudo-class",
					},
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 15,
				},
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "hover",
						selector: "pseudo-class",
					},
					line: 1,
					column: 15,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
		{
			code: "li::marker {}",
			options: [{ disallowPseudoElements: ["marker"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "marker",
						selector: "pseudo-element",
					},
					line: 1,
					column: 3,
					endLine: 1,
					endColumn: 11,
				},
			],
		},
		{
			code: "[class*='foo'] {}",
			options: [{ disallowAttributes: ["class"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "class",
						selector: "attribute",
					},
					line: 1,
					column: 2,
					endLine: 1,
					endColumn: 7,
				},
			],
		},
		{
			code: "img[alt] {}",
			options: [{ disallowAttributes: ["alt"] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "alt",
						selector: "attribute",
					},
					line: 1,
					column: 5,
					endLine: 1,
					endColumn: 8,
				},
			],
		},
		{
			code: "[class*='foo'] {}",
			options: [{ disallowAttributeMatchers: ["*="] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "*=",
						selector: "attribute-matcher",
					},
					line: 1,
					column: 7,
					endLine: 1,
					endColumn: 9,
				},
			],
		},
		{
			code: "[type='text'][name^='foo'] {}",
			options: [{ disallowAttributeMatchers: ["^="] }],
			errors: [
				{
					messageId: "disallowedSelectors",
					data: {
						selectorName: "^=",
						selector: "attribute-matcher",
					},
					line: 1,
					column: 19,
					endLine: 1,
					endColumn: 21,
				},
			],
		},
	],
});
