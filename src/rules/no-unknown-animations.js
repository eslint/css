/**
 * @fileoverview Rule to disallow unknown animation names.
 * @author Gaic4o
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { parse } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { CssLocationRange } from "@eslint/css-tree"
 * @typedef {"unknownAnimation"} NoUnknownAnimationsMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoUnknownAnimationsMessageIds }>} NoUnknownAnimationsRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const animationPropertyPattern =
	/^(?:-(?:o|moz|webkit)-)?animation(?:-name)?$/iu;

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
 * Returns the children of a node as an array. Nodes coming from the rule's
 * AST store children in an array, while nodes produced by `parse()` store
 * them in a list.
 * @param {Object} node The node to read the children of.
 * @returns {Array<Object>} The children of the node.
 */
function getChildren(node) {
	const { children } = node;

	if (!children) {
		return [];
	}

	return Array.isArray(children) ? children : children.toArray();
}

/**
 * Finds every `var()` function inside a node.
 * @param {Object} node The node to search.
 * @param {Array<Object>} varFunctions The array to collect the functions into.
 * @returns {Array<Object>} The `var()` functions found.
 */
function findVarFunctions(node, varFunctions) {
	for (const child of getChildren(node)) {
		if (child.type === "Function" && child.name.toLowerCase() === "var") {
			varFunctions.push(child);
		}

		findVarFunctions(child, varFunctions);
	}

	return varFunctions;
}

/**
 * Replaces every `var()` with whitespace, keeping any fallback value where it
 * was. Because the replacement is the same length as the text it replaces,
 * the remaining value keeps the offsets it has in the original source.
 * @param {string} text The value text to mask.
 * @param {number} baseOffset The offset at which `text` starts in the source.
 * @param {Array<Object>} varFunctions The `var()` functions to mask.
 * @returns {string} The masked value text.
 */
function maskVarFunctions(text, baseOffset, varFunctions) {
	/** @type {Array<[number, number]>} */
	const ranges = [];

	for (const varFunction of varFunctions) {
		const start = varFunction.loc.start.offset - baseOffset;
		const end = varFunction.loc.end.offset - baseOffset;
		const fallback = getChildren(varFunction).find(
			child => child.type === "Raw",
		);

		if (fallback) {
			ranges.push([start, fallback.loc.start.offset - baseOffset]);
			ranges.push([fallback.loc.end.offset - baseOffset, end]);
		} else {
			ranges.push([start, end]);
		}
	}

	let masked = text;

	for (const [start, end] of ranges) {
		masked =
			masked.slice(0, start) +
			" ".repeat(end - start) +
			masked.slice(end);
	}

	return masked;
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
		const { sourceCode } = context;
		const { lexer } = sourceCode;

		/** @type {Set<string>} */
		const definedAnimations = new Set();

		/** @type {Array<{ name: string, loc: CssLocationRange }>} */
		const usedAnimations = [];

		/**
		 * Finds the animation names that a declaration value refers to. Only
		 * names that can be determined statically are returned, so a value
		 * such as `var(--name)` contributes no name while the fallback in
		 * `var(--name, slide-in)` does.
		 * @param {string} property The property the value belongs to.
		 * @param {Object} value The value node to search.
		 * @returns {Array<{ name: string, loc: CssLocationRange }>} The names found.
		 */
		function findAnimationNames(property, value) {
			let valueNode = value;
			let matchResult = lexer.matchProperty(property, valueNode);

			if (matchResult.error) {
				let varFunctions = findVarFunctions(valueNode, []);

				/*
				 * A value that doesn't match the property grammar for any
				 * other reason is an invalid value, which is outside the
				 * scope of this rule.
				 */
				if (varFunctions.length === 0) {
					return [];
				}

				const baseOffset = valueNode.loc.start.offset;
				const { line, column } = valueNode.loc.start;
				let text = sourceCode.getText(value);

				/*
				 * Masking replaces a `var()` with its fallback, which may
				 * contain another `var()`, so keep masking until none are
				 * left. Each pass removes at least one `var()`, so this
				 * always terminates.
				 */
				while (varFunctions.length > 0) {
					text = maskVarFunctions(text, baseOffset, varFunctions);
					valueNode = parse(text, {
						context: "value",
						positions: true,
						offset: baseOffset,
						line,
						column,
					});
					varFunctions = findVarFunctions(valueNode, []);
				}

				matchResult = lexer.matchProperty(property, valueNode);

				if (matchResult.error) {
					return [];
				}
			}

			const names = [];

			for (const child of getChildren(valueNode)) {
				if (!matchResult.isType(child, "keyframes-name")) {
					continue;
				}

				/*
				 * The lexer only matches an identifier or a string as a
				 * keyframes name, so a name is always found here.
				 */
				names.push({
					name: /** @type {string} */ (getAnimationName(child)),
					loc: child.loc,
				});
			}

			return names;
		}

		return {
			"Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i] > AtrulePrelude"(
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

				usedAnimations.push(
					...findAnimationNames(node.property, node.value),
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
