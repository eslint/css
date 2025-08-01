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
		"a { font: var(--foo) Arial; }",
		"a { font-size: calc(10px + 2px); }",
		"a { font-size: smaller; }",
		"a { font: smaller Arial, sans-serif; }",
		"a { font-size: larger; }",
		"a { font: larger Arial, sans-serif; }",
		"a { font-size: inherit; }",
		"a { font: inherit Arial, sans-serif; }",
		"a { font-size: initial; }",
		"a { font: initial Arial, sans-serif; }",
		"a { font-size: revert; }",
		"a { font: revert Arial, sans-serif; }",
		"a { font-size: revert-layer; }",
		"a { font: revert-layer Arial, sans-serif; }",
		"a { font-size: unset; }",
		"a { font: unset Arial, sans-serif; }",
		{
			code: "a { font-size: 1em; }",
			options: [
				{
					allowUnits: ["em"],
				},
			],
		},
		{
			code: "a { font-size: 20%; }",
			options: [
				{
					allowUnits: ["%"],
				},
			],
		},
		{
			code: "a { font-size: 2cap; }",
			options: [
				{
					allowUnits: ["cap"],
				},
			],
		},
		{
			code: "a { font-size: 20ch; }",
			options: [
				{
					allowUnits: ["ch"],
				},
			],
		},
		{
			code: "a { font-size: 3ex; }",
			options: [
				{
					allowUnits: ["ex"],
				},
			],
		},
		{
			code: "a { font-size: 2ic; }",
			options: [
				{
					allowUnits: ["ic"],
				},
			],
		},
		{
			code: "a { font-size: 1lh; }",
			options: [
				{
					allowUnits: ["lh"],
				},
			],
		},
		{
			code: "a { font-size: 2rcap; }",
			options: [
				{
					allowUnits: ["rcap"],
				},
			],
		},
		{
			code: "a { font-size: 20rch; }",
			options: [
				{
					allowUnits: ["rch"],
				},
			],
		},
		{
			code: "a { font-size: 2rex; }",
			options: [
				{
					allowUnits: ["rex"],
				},
			],
		},
		{
			code: "a { font-size: 1.5ric; }",
			options: [
				{
					allowUnits: ["ric"],
				},
			],
		},
		{
			code: "a { font-size: 1rlh; }",
			options: [
				{
					allowUnits: ["rlh"],
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
					allowUnits: ["rem", "em"],
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
					allowUnits: ["em"],
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
					allowUnits: ["rem", "em"],
				},
			],
		},
		{
			code: "a { font: 20% Arial, sans-serif; }",
			options: [
				{
					allowUnits: ["%"],
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
					allowUnits: ["rem", "em"],
				},
			],
		},
		{
			code: dedent`
                a {
                    font: italic small-caps bold condensed 18rem/1.6px "Georgia", serif;
                }
            `,
			options: [
				{
					allowUnits: ["rem", "em"],
				},
			],
		},
		{
			code: "a { font-size: smaller; }",
			options: [
				{
					allowUnits: ["em"],
				},
			],
		},
		{
			code: "a { font: larger Arial, sans-serif; }",
			options: [
				{
					allowUnits: ["em"],
				},
			],
		},
		{
			code: "a { font-size: inherit; }",
			options: [
				{
					allowUnits: ["em"],
				},
			],
		},
		{
			code: "a { font: unset Arial, sans-serif; }",
			options: [
				{
					allowUnits: ["em"],
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
					allowUnits: ["em"],
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
					allowUnits: ["em"],
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
					allowUnits: ["%"],
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
					allowUnits: ["cap"],
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
					allowUnits: ["ch"],
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
					allowUnits: ["ex"],
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
					allowUnits: ["ic"],
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
					allowUnits: ["em"],
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
					allowUnits: ["lh"],
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
					allowUnits: ["rcap"],
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
					allowUnits: ["rch"],
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
					allowUnits: ["rex"],
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
					allowUnits: ["ric"],
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
					allowUnits: ["rlh"],
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
					allowUnits: ["em"],
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
					allowUnits: ["em"],
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
			code: "a { font-size: xxx-large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: xxx-large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: math; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: math Arial, sans-serif; }",
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
					allowUnits: ["em"],
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
					allowUnits: ["em"],
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
					allowUnits: ["%"],
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
					allowUnits: ["%"],
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
					allowUnits: ["%", "em"],
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
					allowUnits: ["rem", "rex"],
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
					allowUnits: ["rem", "rex", "%"],
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
					allowUnits: ["lh", "rex", "%"],
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
                    font: italic bold 1.2em/2 "Helvetica", sans-serif;
                }
            `,
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: ultra-condensed small-caps 1.2em "Fira Sans", sans-serif;
                }
            `,
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: italic small-caps 700 condensed 16px/1.5 "Helvetica Neue", sans-serif;
                }
            `,
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: dedent`
                a {
                    font: caption;
                    font-size: 20px;
                }
            `,
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: XX-SMALL; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: XX-SMALL Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: X-SMALL; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: X-SMALL Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: SMALL; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: SMALL Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: MEDIUM; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: MEDIUM Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: LARGE; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: LARGE Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: X-LARGE; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: X-LARGE Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: XX-LARGE; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: XX-LARGE Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: XXX-LARGE; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: XXX-LARGE Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: MATH; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: MATH Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Xx-Small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Xx-Small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: X-Small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: X-Small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Small; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Small Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Medium; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Medium Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: X-Large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: X-Large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Xx-Large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Xx-Large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Xxx-Large; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Xxx-Large Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font-size: Math; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
		{
			code: "a { font: Math Arial, sans-serif; }",
			errors: [
				{
					messageId: "allowedFontUnits",
				},
			],
		},
	],
});
