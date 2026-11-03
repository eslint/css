/**
 * @fileoverview Enforce the use of relative units for font size.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { parse, toPlainObject } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CssNode, CssNodePlain, FunctionNodePlain, Lexer, ParenthesesPlain, Raw, ValuePlain } from "@eslint/css-tree"
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

/**
 * Parses the fallback of a `var()` function, which the parser leaves as a `Raw` node.
 * The locations in the parsed value point to the original source.
 * @param {Raw} raw The `Raw` node that holds the fallback.
 * @returns {ValuePlain} The parsed fallback value.
 */
function parseVarFallback(raw) {
	const { offset, line, column } = raw.loc.start;

	return /** @type {ValuePlain} */ (
		toPlainObject(
			parse(raw.value, {
				context: "value",
				positions: true,
				offset,
				line,
				column,
			}),
		)
	);
}

/**
 * Finds the nodes in a font size value that use a unit or keyword that is not allowed.
 * Function arguments, including `var()` fallbacks, are checked recursively. Inside
 * functions only lengths are checked, so arguments such as the angle in `sin(30deg)` are ignored.
 * @param {CssNodePlain} value The font size value.
 * @param {string[]} allowedFontUnits The relative units that are allowed.
 * @param {Lexer} lexer The lexer used to identify lengths.
 * @returns {CssNodePlain[]} The disallowed nodes.
 */
function getDisallowedFontSizeNodes(value, allowedFontUnits, lexer) {
	if (value.type !== "Function") {
		return isDisallowedFontSize(value, allowedFontUnits) ? [value] : [];
	}

	/** @type {CssNodePlain[]} */
	const disallowedNodes = [];

	/**
	 * Collects the disallowed nodes among the arguments of a function or expression.
	 * @param {FunctionNodePlain | ParenthesesPlain | ValuePlain} node The node whose arguments are checked.
	 * @returns {void}
	 */
	function checkArguments(node) {
		for (const child of node.children) {
			if (child.type === "Function" || child.type === "Parentheses") {
				checkArguments(child);
			} else if (
				child.type === "Raw" &&
				node.type === "Function" &&
				node.name.toLowerCase() === "var"
			) {
				checkArguments(parseVarFallback(child));
			} else if (
				isDisallowedFontSize(child, allowedFontUnits) &&
				(child.type !== "Dimension" ||
					lexer.matchType("length", child).matched)
			) {
				disallowedNodes.push(child);
			}
		}
	}

	checkArguments(value);

	return disallowedNodes;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {RelativeFontUnitsRuleDefinition} */ ({
	meta: {
		type: "suggestion",
		languages: ["css/css"],

		docs: {
			description: "Enforce the use of relative font units",
			dialects: ["CSS"],
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

		/**
		 * Reports the disallowed units and keywords in a font size value.
		 * @param {CssNodePlain} value The font size value.
		 * @returns {void}
		 */
		function checkFontSize(value) {
			for (const disallowedNode of getDisallowedFontSizeNodes(
				value,
				allowedFontUnits,
				lexer,
			)) {
				context.report({
					loc: disallowedNode.loc,
					messageId: "allowedFontUnits",
					data: {
						allowedFontUnits: allowedFontUnits.join(", "),
					},
				});
			}
		}

		return {
			Declaration(node) {
				const property = node.property.toLowerCase();

				if (property === "font-size") {
					if (
						node.value.type === "Value" &&
						node.value.children.length > 0
					) {
						checkFontSize(node.value.children[0]);
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

						if (fontSizeNode) {
							checkFontSize(fontSizeNode);
						}
					}
				}
			},
		};
	},
});
