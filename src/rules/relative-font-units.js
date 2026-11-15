/**
 * @fileoverview Enforce the use of relative units for font size.
 * @author Tanuj Kanti
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CssNode, CssNodePlain, FunctionNodePlain, Lexer } from "@eslint/css-tree"
 * @typedef {"allowedFontUnits"} RelativeFontUnitsMessageIds
 * @typedef {[{allowUnits?: string[], allowUnitsInMathFunctions?: string[]}]} RelativeFontUnitsOptions
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

const unitsToAllowInMathFunctions = [
	"vw",
	"vh",
	"vi",
	"vb",
	"vmin",
	"vmax",
	"svw",
	"svh",
	"svi",
	"svb",
	"svmin",
	"svmax",
	"lvw",
	"lvh",
	"lvi",
	"lvb",
	"lvmin",
	"lvmax",
	"dvw",
	"dvh",
	"dvi",
	"dvb",
	"dvmin",
	"dvmax",
	"cqw",
	"cqh",
	"cqi",
	"cqb",
	"cqmin",
	"cqmax",
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

const mathFunctions = new Set([
	"abs",
	"acos",
	"asin",
	"atan",
	"atan2",
	"calc",
	"clamp",
	"cos",
	"exp",
	"hypot",
	"log",
	"max",
	"min",
	"mod",
	"pow",
	"progress",
	"rem",
	"round",
	"sign",
	"sin",
	"sqrt",
	"tan",
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
 * Gets the arguments of a function that can hold a font size: all arguments of a
 * math function and the fallback of `env()`. Arguments of other functions are not
 * returned because it is unknown how those functions use them.
 * @param {FunctionNodePlain} func The function node.
 * @param {string[]} allowedUnitsInMathFunctions The relative units that are allowed inside math functions.
 * @returns {Array<{ node: CssNodePlain, isMathFunction: boolean }>} The arguments to check.
 */
function getFontSizeArguments(func, allowedUnitsInMathFunctions) {
	const name = func.name.toLowerCase();

	if (mathFunctions.has(name)) {
		const disallowedInMathFunction = func.children.filter(
			child =>
				child.type !== "Dimension" ||
				(child.unit &&
					!allowedUnitsInMathFunctions.includes(
						child.unit.toLowerCase(),
					)),
		);

		return disallowedInMathFunction.map(node => ({
			node,
			isMathFunction: true,
		}));
	}

	if (name === "env") {
		const commaIndex = func.children.findIndex(
			child => child.type === "Operator" && child.value === ",",
		);

		return commaIndex === -1
			? []
			: func.children
					.slice(commaIndex + 1)
					.map(node => ({ node, isMathFunction: false }));
	}

	return [];
}

/**
 * Finds the nodes in a font size value that use a unit or keyword that is not allowed.
 * Arguments of math functions and the fallback of `env()` are checked recursively. Inside
 * functions only lengths are checked, so arguments such as the angle in `sin(30deg)` are ignored.
 * @param {CssNodePlain} value The font size value.
 * @param {string[]} allowedFontUnits The relative units that are allowed.
 * @param {Lexer} lexer The lexer used to identify lengths.
 * @param {string[]} allowedUnitsInMathFunctions The relative units that are allowed inside math functions.
 * @returns {Array<{ node: CssNodePlain, isMathFunction: boolean }>} The disallowed nodes.
 */
function getDisallowedFontSizeNodes(
	value,
	allowedFontUnits,
	lexer,
	allowedUnitsInMathFunctions,
) {
	if (value.type !== "Function") {
		return isDisallowedFontSize(value, allowedFontUnits)
			? [{ node: value, isMathFunction: false }]
			: [];
	}

	/** @type {Array<{ node: CssNodePlain, isMathFunction: boolean }>} */
	const disallowedNodes = [];

	/**
	 * Collects the disallowed nodes among the given function arguments.
	 * @param {Array<{ node: CssNodePlain, isMathFunction: boolean }>} nodes The function arguments to check.
	 * @returns {void}
	 */
	function checkArguments(nodes) {
		for (const { node, isMathFunction } of nodes) {
			if (node.type === "Function") {
				checkArguments(
					getFontSizeArguments(node, allowedUnitsInMathFunctions),
				);
			} else if (node.type === "Parentheses") {
				checkArguments(
					node.children
						.filter(
							child =>
								!isMathFunction ||
								child.type !== "Dimension" ||
								(child.unit &&
									!allowedUnitsInMathFunctions.includes(
										child.unit.toLowerCase(),
									)),
						)
						.map(child => ({ node: child, isMathFunction })),
				);
			} else if (
				isDisallowedFontSize(node, allowedFontUnits) &&
				(node.type !== "Dimension" ||
					lexer.matchType("length", node).matched)
			) {
				disallowedNodes.push({ node, isMathFunction });
			}
		}
	}

	checkArguments(getFontSizeArguments(value, allowedUnitsInMathFunctions));

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
					allowUnitsInMathFunctions: {
						type: "array",
						items: {
							enum: unitsToAllowInMathFunctions,
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
				allowUnitsInMathFunctions: [],
			},
		],

		messages: {
			allowedFontUnits:
				"Use only allowed relative units for 'font-size' - {{allowedFontUnits}}{{allowedUnitsInMathFunctionsMessage}}.",
		},
	},

	create(context) {
		const [
			{
				allowUnits: allowedFontUnits,
				allowUnitsInMathFunctions: allowedUnitsInMathFunctions,
			},
		] = context.options;
		const { lexer } = context.sourceCode;

		/**
		 * Reports the disallowed units and keywords in a font size value.
		 * @param {CssNodePlain} value The font size value.
		 * @returns {void}
		 */
		function checkFontSize(value) {
			for (const {
				node: disallowedNode,
				isMathFunction,
			} of getDisallowedFontSizeNodes(
				value,
				allowedFontUnits,
				lexer,
				allowedUnitsInMathFunctions,
			)) {
				context.report({
					loc: disallowedNode.loc,
					messageId: "allowedFontUnits",
					data: {
						allowedFontUnits: allowedFontUnits.join(", "),
						allowedUnitsInMathFunctionsMessage:
							allowedUnitsInMathFunctions.length && isMathFunction
								? `. Additional units allowed in math functions - ${allowedUnitsInMathFunctions.join(", ")}`
								: "",
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
