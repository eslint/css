/**
 * @fileoverview Tests for relative-font-units rule.
 * @author Tanuj Kanti
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import rule from "../../src/rules/relative-font-units.js";
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

ruleTester.run("relative-font-units", rule, {
	valid: [
		"a { font-size: 1rem; }",
		"a { font: 2rem Arial, sans-serif; }",
		"a { font: 1.2rem/2 Arial, sans-serif; }",
		"a { font-size: var(--foo); }",
		"a { font: Arial var(-foo); }",
		{
			code: "a { font-size: 1em; }",
			options: [
				{
					allow: ["em"],
				},
			],
		},
		{
			code: "a { font-size: 20%; }",
			options: [
				{
					allow: ["%"],
				},
			],
		},
		{
			code: "a { font-size: 2cap; }",
			options: [
				{
					allow: ["cap"],
				},
			],
		},
		{
			code: "a { font-size: 20ch; }",
			options: [
				{
					allow: ["ch"],
				},
			],
		},
		{
			code: "a { font-size: 3ex; }",
			options: [
				{
					allow: ["ex"],
				},
			],
		},
		{
			code: "a { font-size: 2ic; }",
			options: [
				{
					allow: ["ic"],
				},
			],
		},
		{
			code: "a { font-size: 1lh; }",
			options: [
				{
					allow: ["lh"],
				},
			],
		},
		{
			code: "a { font-size: 2rcap; }",
			options: [
				{
					allow: ["rcap"],
				},
			],
		},
		{
			code: "a { font-size: 20rch; }",
			options: [
				{
					allow: ["rch"],
				},
			],
		},
		{
			code: "a { font-size: 2rex; }",
			options: [
				{
					allow: ["rex"],
				},
			],
		},
		{
			code: "a { font-size: 1.5ric; }",
			options: [
				{
					allow: ["ric"],
				},
			],
		},
		{
			code: "a { font-size: 1rlh; }",
			options: [
				{
					allow: ["rlh"],
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 1rem;
                }
                b {
                    font-size: 1em;
                }
            `,
			options: [
				{
					allow: ["rem", "em"],
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 1em;
                    height: 20px;
                }
            `,
			options: [
				{
					allow: ["em"],
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 1em;
                    height: 20px;
                }
                b {
                    font-size: 1rem;
                }
            `,
			options: [
				{
					allow: ["rem", "em"],
				},
			],
		},
		{
			code: "a { font: 20% Arial, sans-serif; }",
			options: [
				{
					allow: ["%"],
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 1rem;
                    height: 20px;
                }
                b {
                    font: 2em Arial, sans-serif;
                }
            `,
			options: [
				{
					allow: ["rem", "em"],
				},
			],
		},
	],
	invalid: [
		{
			code: "a { font-size: 1px; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 1em; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 1rem; }",
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 20%; }",
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2em; }",
			options: [
				{
					allow: ["%"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 20ch; }",
			options: [
				{
					allow: ["cap"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2cap; }",
			options: [
				{
					allow: ["ch"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 10px; }",
			options: [
				{
					allow: ["ex"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2rem; }",
			options: [
				{
					allow: ["ic"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2ic; }",
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 1rlh; }",
			options: [
				{
					allow: ["lh"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 1lh; }",
			options: [
				{
					allow: ["rcap"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2in; }",
			options: [
				{
					allow: ["rch"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 3ex; }",
			options: [
				{
					allow: ["rex"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 2rem; }",
			options: [
				{
					allow: ["ric"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: 1lh; }",
			options: [
				{
					allow: ["rlh"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 1rem;
                }
                b {
                    font-size: 1em;
                }
            `,
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 10px;
                    height: 3em;
                }
            `,
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: xx-small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: xx-small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: x-small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: x-small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: medium; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: medium Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: x-large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: x-large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: xx-large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: xx-large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: smaller; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: smaller Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: larger; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: larger Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: 2rem Arial, sans-serif;
                }
            `,
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: 20% Arial, sans-serif;
                }
            `,
			options: [
				{
					allow: ["em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: 2em Arial, sans-serif;
                }
            `,
			options: [
				{
					allow: ["%"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: small Arial, sans-serif;
                }
            `,
			options: [
				{
					allow: ["%"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 2rem;
                }
            `,
			options: [
				{
					allow: ["%", "em"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 2rem;
                }
                b {
                    font-size: 2em;
                }
            `,
			options: [
				{
					allow: ["rem", "rex"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font-size: 2rem;
                    height: 50%;
                }
                b {
                    font-size: 2em;
                }
            `,
			options: [
				{
					allow: ["rem", "rex", "%"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: italic bold 2rem "Helvetica", sans-serif;
                }
            `,
			options: [
				{
					allow: ["lh", "rex", "%"],
				},
			],
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
	],
});
