/**
 * @fileoverview Rule to disallow unknown animation names.
 * @author Gaic4o
 */

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

const animationPropertyPattern = /^animation(?:-name)?$/iu;

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
		const lexer = context.sourceCode.lexer;

		/** @type {Set<string>} */
		const definedAnimations = new Set();

		/** @type {Array<{ name: string, loc: CssLocationRange }>} */
		const usedAnimations = [];

		return {
			"Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i] > AtrulePrelude"(
				node,
			) {
				const child = node.children[0];
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

				const matchResult = lexer.matchProperty(
					node.property,
					node.value,
				);

				/*
				 * If the value can't be matched against the property grammar,
				 * its animation name can't be determined reliably. This
				 * includes dynamic values such as var(). Invalid property
				 * values are outside the scope of this rule.
				 */
				if (matchResult.error) {
					return;
				}

				for (const child of node.value.children) {
					if (!matchResult.isType(child, "keyframes-name")) {
						continue;
					}

					const name = getAnimationName(child);

					if (name !== null) {
						usedAnimations.push({
							name,
							loc: child.loc,
						});
					}
				}
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
