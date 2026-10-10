/**
 * @fileoverview Rule to disallow unknown animation names.
 * @author Gaic4o
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
 * @import { CssLocationRange, ValuePlain } from "@eslint/css-tree"
 * @typedef {"unknownAnimation"} NoUnknownAnimationsMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoUnknownAnimationsMessageIds }>} NoUnknownAnimationsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const animationPropertyPattern =
	/^(?:-(?:o|ms|moz|webkit)-)?animation(?:-name)?$/iu;

/**
 * Keywords that the `animation` shorthand accepts for its other
 * sub-properties, mapped to the sub-property each one belongs to.
 */
const shorthandKeywordProperties = new Map([
	["linear", "animation-timing-function"],
	["ease", "animation-timing-function"],
	["ease-in", "animation-timing-function"],
	["ease-out", "animation-timing-function"],
	["ease-in-out", "animation-timing-function"],
	["step-start", "animation-timing-function"],
	["step-end", "animation-timing-function"],
	["infinite", "animation-iteration-count"],
	["normal", "animation-direction"],
	["reverse", "animation-direction"],
	["alternate", "animation-direction"],
	["alternate-reverse", "animation-direction"],
	["none", "animation-fill-mode"],
	["forwards", "animation-fill-mode"],
	["backwards", "animation-fill-mode"],
	["both", "animation-fill-mode"],
	["running", "animation-play-state"],
	["paused", "animation-play-state"],
]);

/**
 * Functions that the `animation` shorthand accepts as its timing function.
 */
const easingFunctionNames = new Set(["cubic-bezier", "linear", "steps"]);

/**
 * Extracts an animation name from a node. Quoted and unquoted animation
 * names refer to the same animation, so `"fade-in"` and `fade-in` both
 * yield `fade-in`.
 * @param {Object} node The node to extract the animation name from.
 * @returns {string|null} The animation name, or `null` if the node isn't a name.
 */
function getAnimationName(node) {
	if (node.type === "Identifier") {
		return node.name;
	}

	if (node.type === "String") {
		return node.value;
	}

	return null;
}

/**
 * Gets the nodes to search for animation names in the fallback of a `var()`
 * function. A fallback kept as raw text is parsed as a value so that a
 * nested `var()` or a comma-separated list of names in it is searched like
 * any other value. A custom syntax that replaces the `var()` parser may parse
 * the fallback as a value instead, and that value is searched as is. Any
 * other fallback contributes no names.
 * @param {Object} fallback The node holding the fallback.
 * @returns {Array<Object>} The nodes to search.
 */
function getVarFallbackNodes(fallback) {
	if (fallback.type === "Raw") {
		const { offset, line, column } = fallback.loc.start;

		try {
			const value = /** @type {ValuePlain} */ (
				toPlainObject(
					parse(fallback.value, {
						context: "value",
						positions: true,
						offset,
						line,
						column,
					}),
				)
			);

			return value.children;
		} catch {
			/*
			 * The fallback is parsed with the default syntax, so one written
			 * in a custom syntax may not be parseable. Its names can't be
			 * determined then, so it contributes none.
			 */
			return [];
		}
	}

	return fallback.type === "Value" ? fallback.children : [];
}

/**
 * Replaces each `var()` in a list of value nodes with the nodes of its
 * fallback. A `var()` can't be resolved statically, so one without a
 * fallback is dropped.
 * @param {Array<Object>} nodes The value nodes.
 * @returns {Array<Object>} The value nodes with each `var()` replaced.
 */
function expandVarFallbacks(nodes) {
	return nodes.flatMap(node => {
		if (node.type !== "Function" || node.name.toLowerCase() !== "var") {
			return [node];
		}

		/*
		 * The fallback, if any, is the third child after the custom
		 * property name and the comma.
		 */
		const fallback = node.children[2];

		return fallback
			? expandVarFallbacks(getVarFallbackNodes(fallback))
			: [];
	});
}

/**
 * Gets the sub-property of the `animation` shorthand, other than
 * `animation-name`, that a node can be a value of.
 * @param {Object} node The value node.
 * @returns {string|null} The sub-property, or `null` if there is none.
 */
function getShorthandProperty(node) {
	switch (node.type) {
		case "Identifier":
			return (
				shorthandKeywordProperties.get(node.name.toLowerCase()) ?? null
			);

		case "Number":
			return "animation-iteration-count";

		case "Function":
			return easingFunctionNames.has(node.name.toLowerCase())
				? "animation-timing-function"
				: null;

		default:
			return null;
	}
}

/**
 * Finds the animation names in a list of value nodes. An identifier or a
 * string is a name unless it's a keyword. In the shorthand, a keyword of
 * another sub-property is a value of that sub-property if the animation
 * doesn't have one yet, and an animation name otherwise. The value isn't
 * validated, so names are found even when the rest of the value is invalid.
 * @param {Array<Object>} nodes The value nodes to search.
 * @param {Set<string>} nameKeywords The lowercase keywords that `animation-name` accepts.
 * @param {boolean} isShorthand Whether the value belongs to the `animation` shorthand.
 * @param {Array<{ name: string, loc: CssLocationRange }>} names The array to collect the names into.
 * @returns {void}
 */
function findAnimationNames(nodes, nameKeywords, isShorthand, names) {
	// The sub-properties that the current animation has a value for.
	const usedProperties = new Set();

	for (const node of expandVarFallbacks(nodes)) {
		if (isShorthand) {
			// A comma separates one animation from the next.
			if (node.type === "Operator" && node.value === ",") {
				usedProperties.clear();
				continue;
			}

			const property = getShorthandProperty(node);

			if (property !== null && !usedProperties.has(property)) {
				usedProperties.add(property);
				continue;
			}
		}

		if (node.type === "Identifier") {
			const name = node.name.toLowerCase();

			/*
			 * In the shorthand, `auto` and dashed identifiers such as
			 * `--timeline` may name a timeline instead of an animation, so
			 * they're skipped.
			 */
			if (
				nameKeywords.has(name) ||
				(isShorthand && (name === "auto" || name.startsWith("--")))
			) {
				continue;
			}
		}

		const name = getAnimationName(node);

		if (name !== null) {
			names.push({ name, loc: node.loc });
		}
	}
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoUnknownAnimationsRuleDefinition} */ ({
	meta: {
		type: "problem",

		docs: {
			description: "Disallow unknown animation names",
			recommended: false,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-unknown-animations.md",
		},

		messages: {
			unknownAnimation: "Unknown animation name '{{name}}' found.",
		},
	},

	create(context) {
		const cssWideKeywords = context.sourceCode.lexer.cssWideKeywords.map(
			keyword => keyword.toLowerCase(),
		);

		// `animation-name` also accepts `none` in place of an animation name.
		const animationNameKeywords = new Set(["none", ...cssWideKeywords]);

		/** @type {Set<string>} */
		const definedAnimations = new Set();

		/** @type {Array<{ name: string, loc: CssLocationRange }>} */
		const usedAnimations = [];

		return {
			"Atrule[name=/^(-(o|ms|moz|webkit)-)?keyframes$/i] > AtrulePrelude"(
				node,
			) {
				const child = node.children[0];

				/*
				 * A prelude that isn't an identifier or a string, such as the
				 * one in `@keyframes 50%`, doesn't name an animation.
				 */
				const name = child ? getAnimationName(child) : null;

				if (name !== null) {
					definedAnimations.add(name);
				}
			},

			"Rule > Block Declaration"(node) {
				if (
					!animationPropertyPattern.test(node.property) ||
					node.value.type !== "Value"
				) {
					return;
				}

				const isShorthand = !node.property
					.toLowerCase()
					.endsWith("-name");

				findAnimationNames(
					node.value.children,
					animationNameKeywords,
					isShorthand,
					usedAnimations,
				);
			},

			/*
			 * Usages are reported only after the entire stylesheet has been
			 * visited so that `@keyframes` rules defined after their usage
			 * are still found.
			 */
			"StyleSheet:exit"() {
				for (const { name, loc } of usedAnimations) {
					if (definedAnimations.has(name)) {
						continue;
					}

					context.report({
						loc,
						messageId: "unknownAnimation",
						data: { name },
					});
				}
			},
		};
	},
});
