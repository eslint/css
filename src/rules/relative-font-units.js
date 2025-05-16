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
 * @typedef {[{allow?: string[]}]} RelativeFontUnitsOptions
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

const fontSizeIdentifiers = new Set([
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"smaller",
	"larger",
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
					allow: {
						type: "array",
						items: {
							enum: relativeFontUnits,
							uniqueItems: true,
						},
					},
				},
			},
		],

		defaultOptions: [
			{
				allow: ["rem"],
			},
		],

		messages: {
			allowedFontUnits:
				"Use only allowed relative units for 'font-size' - {{allowedFontUnits}}.",
		},
	},

	create(context) {
		const [{ allow: allowedFontUnits }] = context.options;

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
								!allowedFontUnits.includes(value.unit)) ||
							value.type === "Identifier" ||
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
							child =>
								child.type === "Identifier" &&
								fontSizeIdentifiers.has(child.name),
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
								check: identifierNode,
								loc: identifierNode?.loc,
							},
							{
								check:
									dimensionNode &&
									!allowedFontUnits.includes(
										dimensionNode.unit,
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
