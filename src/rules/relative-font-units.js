/**
 * @fileoverview Enforce the use of relative units for font size.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CssNode, CssNodePlain } from "@eslint/css-tree"
 * @typedef {"allowedFontUnits"} RelativeFontUnitsMessageIds
 * @typedef {[{allowUnits?: string[]}]} RelativeFontUnitsOptions
 * @typedef {CSSRuleDefinition<{ RuleOptions: RelativeFontUnitsOptions, MessageIds: RelativeFontUnitsMessageIds}>} RelativeFontUnitsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const relativeFontUnits = [
	"%",
	"cap",
	"ch",
	"em",
	"ex",
	"ic",
	"lh",
	"rcap",
	"rch",
	"rem",
	"rex",
	"ric",
	"rlh",
];

const disallowedFontSizeKeywords = new Set([
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"xxx-large",
	"math",
]);

/**
 * Checks whether a font size uses a unit or keyword that is not allowed.
 * @param {CssNodePlain} value The font size value.
 * @param {string[]} allowedFontUnits The relative units that are allowed.
 * @returns {boolean} Whether the font size value is disallowed.
 */
function isDisallowedFontSize(value, allowedFontUnits) {
	return (
		(value.type === "Dimension" &&
			!allowedFontUnits.includes(value.unit.toLowerCase())) ||
		(value.type === "Identifier" &&
			disallowedFontSizeKeywords.has(value.name.toLowerCase())) ||
		(value.type === "Percentage" && !allowedFontUnits.includes("%"))
	);
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {RelativeFontUnitsRuleDefinition} */ ({
	meta: {
		type: "suggestion",

		docs: {
			description: "Enforce the use of relative font units",
			recommended: false,
			url: "https://github.com/eslint/css/blob/main/docs/rules/relative-font-units.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowUnits: {
						type: "array",
						items: {
							enum: relativeFontUnits,
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowUnits: ["rem"],
			},
		],

		messages: {
			allowedFontUnits:
				"Use only allowed relative units for 'font-size' - {{allowedFontUnits}}.",
		},
	},

	create(context) {
		const [{ allowUnits: allowedFontUnits }] = context.options;
		const { lexer } = context.sourceCode;

		return {
			Declaration(node) {
				const property = node.property.toLowerCase();

				if (property === "font-size") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						const value = node.value.children[0];

						if (isDisallowedFontSize(value, allowedFontUnits)) {
							context.report({
								loc: value.loc,
								messageId: "allowedFontUnits",
								data: {
									allowedFontUnits:
										allowedFontUnits.join(", "),
								},
							});
						}
					}
				}

				if (property === "font") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						const value = node.value;
						const match = lexer.matchProperty("font", value);
						const fontSizeNode = match.matched
							? value.children.find(child =>
									match.isProperty(
										/** @type {CssNode} */ (child),
										"font-size",
									),
								)
							: undefined;

						if (
							fontSizeNode &&
							isDisallowedFontSize(fontSizeNode, allowedFontUnits)
						) {
							context.report({
								loc: fontSizeNode.loc,
								messageId: "allowedFontUnits",
								data: {
									allowedFontUnits:
										allowedFontUnits.join(", "),
								},
							});
						}
					}
				}
			},
		};
	},
});
