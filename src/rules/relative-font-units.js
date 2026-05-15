/**
 * @fileoverview Enforce the use of relative units for font size.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
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

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

/** @type {RelativeFontUnitsRuleDefinition} */
export default {
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

		return {
			Declaration(node) {
				if (node.property === "font-size") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						const value = node.value.children[0];

						if (
							(value.type === "Dimension" &&
								!allowedFontUnits.includes(
									value.unit.toLowerCase(),
								)) ||
							(value.type === "Identifier" &&
								disallowedFontSizeKeywords.has(
									value.name.toLowerCase(),
								)) ||
							(value.type === "Percentage" &&
								!allowedFontUnits.includes("%"))
						) {
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

				if (node.property === "font") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						const value = node.value;

						const dimensionNode = value.children.find(
							child => child.type === "Dimension",
						);
						const identifierNode = value.children.find(
							child => child.type === "Identifier",
						);
						const percentageNode = value.children.find(
							child => child.type === "Percentage",
						);
						let location;
						let shouldReport = false;

						const conditions = [
							{
								check:
									!allowedFontUnits.includes("%") &&
									percentageNode,
								loc: percentageNode?.loc,
							},
							{
								check:
									identifierNode &&
									disallowedFontSizeKeywords.has(
										identifierNode.name.toLowerCase(),
									),
								loc: identifierNode?.loc,
							},
							{
								check:
									dimensionNode &&
									!allowedFontUnits.includes(
										dimensionNode.unit.toLowerCase(),
									),
								loc: dimensionNode?.loc,
							},
						];
						for (const condition of conditions) {
							if (condition.check) {
								shouldReport = true;
								location = condition.loc;
								break;
							}
						}

						if (shouldReport) {
							context.report({
								loc: location,
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
};
