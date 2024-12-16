/**
 * @fileoverview Rule to enforce the maximum specificity of CSS selectors.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").SelectorPlain} SelectorPlain */
/**
 * @typedef {object} Specificity
 * @property {number} a The number of ID selectors in the selector.
 * @property {number} b The number of class selectors, attribute selectors, and pseudo-classes in the selector.
 * @property {number} c The number of type selectors and pseudo-elements in the selector.
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Calculates the specificity of a CSS selector.
 * @param {SelectorPlain} selector The selector to calculate specificity for.
 * @returns {Specificity} An object with the properties `a`, `b`, and `c` representing the specificity.
 */
function calculateSpecificity(selector) {
	let a = 0;
	let b = 0;
	let c = 0;

	selector.children.forEach(node => {
		// perf: Checking short strings is faster than checking long strings

		// IdSelector
		if (node.type.startsWith("Id")) {
			a += 1;
			return;
		}

		// AttributeSelector, ClassSelector, PseudoClassSelector
		if (
			node.type.startsWith("Att") ||
			node.type.startsWith("Class") ||
			node.type.startsWith("PseudoClass")
		) {
			b += 1;
			return;
		}

		// TypeSelector, PseudoElementSelector
		if (
			node.type.startsWith("Type") ||
			node.type.startsWith("PseudoElement")
		) {
			c += 1;
		}
	});

	return { a, b, c };
}

/**
 * Determines if one specificity is greater than another.
 * @param {Specificity} a The first specificity to compare.
 * @param {Specificity} b The second specificity to compare.
 * @returns {number} -1 if `a` is less than `b`, 0 if they are equal, 1 if `a` is greater than `b`.
 */
function compareSpecificity(a, b) {
	if (a.a !== b.a) {
		return a.a - b.a;
	}
	if (a.b !== b.b) {
		return a.b - b.b;
	}
	return a.c - b.c;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Enforce the maximum specificity of CSS selectors",
		},

		messages: {
			unexpectedSpecificity:
				"Specificity of [{{actual}}] exceeds maximum specificity of [{{expected}}].",
		},

		schema: {
			type: "array",
			items: {
				type: "object",
				properties: {
					a: { type: "number" },
					b: { type: "number" },
					c: { type: "number" },
				},
				additionalProperties: false,
			},
			minItems: 1,
			maxItems: 1,
		},
	},

	create(context) {
		return {
			Selector(node) {
				const specificity = calculateSpecificity(node);

				if (compareSpecificity(specificity, context.options[0]) > 0) {
					context.report({
						node,
						messageId: "unexpectedSpecificity",
						data: {
							actual: `${specificity.a},${specificity.b},${specificity.c}`,
							expected: `${context.options[0].a},${context.options[0].b},${context.options[0].c}`,
						},
					});
				}
			},
		};
	},
};
