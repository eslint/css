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
 * sub-properties. The shorthand treats these as the values of those
 * sub-properties rather than as animation names.
 */
const animationShorthandKeywords = [
	// <easing-function>
	"linear",
	"ease",
	"ease-in",
	"ease-out",
	"ease-in-out",
	"step-start",
	"step-end",
	// <single-animation-iteration-count>
	"infinite",
	// <single-animation-direction>
	"normal",
	"reverse",
	"alternate",
	"alternate-reverse",
	// <single-animation-fill-mode>
	"forwards",
	"backwards",
	"both",
	// <single-animation-play-state>
	"running",
	"paused",
	// <single-animation-timeline>
	"auto",
];

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
 * any other value. A parsed fallback, such as one parsed with
 * `parseCustomProperty`, is searched as is.
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

	return fallback.type === "Value" ? fallback.children : [fallback];
}

/**
 * Finds the animation names in a list of value nodes. An identifier or a
 * string is a name unless the property accepts it as a keyword. A `var()`
 * can't be resolved statically, so only its fallback, if it has one, is
 * searched. The value isn't validated, so names are found even when the
 * rest of the value is invalid.
 * @param {Array<Object>} nodes The value nodes to search.
 * @param {Set<string>} keywords The lowercase keywords that aren't names.
 * @param {boolean} isShorthand Whether the value belongs to the `animation` shorthand.
 * @param {Array<{ name: string, loc: CssLocationRange }>} names The array to collect the names into.
 * @returns {void}
 */
function findAnimationNames(nodes, keywords, isShorthand, names) {
	for (const child of nodes) {
		if (child.type === "Function") {
			/*
			 * The fallback, if any, is the third child after the custom
			 * property name and the comma.
			 */
			const fallback =
				child.name.toLowerCase() === "var" ? child.children[2] : null;

			if (fallback) {
				findAnimationNames(
					getVarFallbackNodes(fallback),
					keywords,
					isShorthand,
					names,
				);
			}

			continue;
		}

		if (child.type === "Identifier") {
			const name = child.name.toLowerCase();

			/*
			 * In the shorthand, a dashed identifier such as `--timeline`
			 * may name a timeline instead of an animation, so it's skipped.
			 */
			if (keywords.has(name) || (isShorthand && name.startsWith("--"))) {
				continue;
			}
		}

		const name = getAnimationName(child);

		if (name !== null) {
			names.push({ name, loc: child.loc });
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
		const shorthandKeywords = new Set([
			...animationNameKeywords,
			...animationShorthandKeywords,
		]);

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
					isShorthand ? shorthandKeywords : animationNameKeywords,
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
