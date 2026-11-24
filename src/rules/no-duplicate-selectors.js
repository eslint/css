/**
 * @fileoverview Rule to disallow duplicate selectors.
 * @author Przemysław Zań
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { generate } from "@eslint/css-tree";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { AtrulePlain, Combinator, CssNodePlain, SelectorListPlain, SelectorPlain } from "@eslint/css-tree"
 * @typedef {"duplicateSelector"} NoDuplicateSelectorsMessageIds
 * @typedef {CSSRuleDefinition<{ RuleOptions: [], MessageIds: NoDuplicateSelectorsMessageIds }>} NoDuplicateSelectorsRuleDefinition
 * @typedef {CssNodePlain[]} ComplexSelector The simple selectors and the combinators of a complex selector.
 * @typedef {{ combinator: Combinator | null, compound: CssNodePlain[] }} CompoundPart A compound selector and the combinator before it.
 * @typedef {{ selectors: ComplexSelector[], isScopeRoot: boolean }} ParentRule The resolved selectors that replace `&`.
 * @typedef {{ check: boolean, parent: ParentRule | null }} NestingContext Whether the rule examines the style rules in a block, and the parent rule of these style rules.
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const keyframesPattern = /^(?:-(?:o|ms|moz|webkit)-)?keyframes$/iu;
// Only CSS whitespace: `\s` also matches identifier characters such as U+00A0.
const lineBreakPattern = /[\t\n\f\r ]*\n[\t\n\f\r ]*/gu;

const legacyPseudoElements = new Set([
	"before",
	"after",
	"first-line",
	"first-letter",
]);

/**
 * Pseudo-classes with arguments that are not relative selectors.
 * In these arguments, a complex parent selector can replace `&` in the first
 * compound selector, and the meaning does not change.
 */
const nonRelativeArgumentPseudoClasses = new Set([
	"is",
	"where",
	"not",
	"nth-child",
	"nth-last-child",
]);

/** @type {CssNodePlain} */
const nestingSelector = { type: "NestingSelector" };

/** @type {CssNodePlain} */
const descendantCombinator = { type: "Combinator", name: " " };

/**
 * Determines whether a node is a nesting selector (`&`).
 * @param {CssNodePlain} node The node to check.
 * @returns {boolean} `true` if the node is a nesting selector.
 */
function isNestingSelector(node) {
	return node.type === "NestingSelector";
}

/**
 * Determines whether a node is a nesting selector (`&`) or the `:scope` pseudo-class.
 * @param {CssNodePlain} node The node to check.
 * @returns {boolean} `true` if the node is a nesting selector or `:scope`.
 */
function isNestingOrScopeSelector(node) {
	return (
		isNestingSelector(node) ||
		(node.type === "PseudoClassSelector" &&
			node.name.toLowerCase() === "scope")
	);
}

/**
 * Determines whether a node is a type selector or the universal selector.
 * @param {CssNodePlain} node The node to check.
 * @returns {boolean} `true` if the node is a type selector or the universal selector.
 */
function isTypeSelector(node) {
	return node.type === "TypeSelector";
}

/**
 * Determines whether a node is a pseudo-element selector, including legacy
 * single-colon pseudo-elements.
 * @param {CssNodePlain} node The node to check.
 * @returns {boolean} `true` if the node is a pseudo-element selector.
 */
function isPseudoElementSelector(node) {
	return (
		node.type === "PseudoElementSelector" ||
		(node.type === "PseudoClassSelector" &&
			legacyPseudoElements.has(node.name.toLowerCase()))
	);
}

/**
 * Determines whether a node or one of its descendants passes a test.
 * @param {CssNodePlain} node The node to examine.
 * @param {(node: CssNodePlain) => boolean} test The test for each node.
 * @returns {boolean} `true` if the node or one of its descendants passes the test.
 */
function containsNode(node, test) {
	if (test(node)) {
		return true;
	}

	if (node.type === "Nth") {
		return node.selector !== null && containsNode(node.selector, test);
	}

	return (
		"children" in node &&
		Array.isArray(node.children) &&
		node.children.some(child => containsNode(child, test))
	);
}

/**
 * Divides a complex selector into compound selectors. A relative selector
 * starts with a part that has no combinator and an empty compound selector.
 * @param {ComplexSelector} selector The complex selector.
 * @returns {CompoundPart[]} The compound selectors with the combinators before them.
 */
function splitCompounds(selector) {
	/** @type {CompoundPart[]} */
	const parts = [];

	/** @type {CompoundPart} */
	let part = { combinator: null, compound: [] };

	for (const node of selector) {
		if (node.type === "Combinator") {
			parts.push(part);
			part = { combinator: node, compound: [] };
		} else {
			part.compound.push(node);
		}
	}

	parts.push(part);

	return parts;
}

/**
 * Returns the index of the first node of the last compound selector.
 * @param {ComplexSelector} selector The complex selector.
 * @returns {number} The index of the first node of the last compound selector.
 */
function getLastCompoundStart(selector) {
	for (let index = selector.length - 1; index >= 0; index--) {
		if (selector[index].type === "Combinator") {
			return index + 1;
		}
	}

	return 0;
}

/**
 * Creates the `:is()` pseudo-class that the CSS Nesting specification gives
 * as the meaning of `&`.
 * @param {ComplexSelector[]} selectors The selectors of the parent rule.
 * @returns {CssNodePlain} The `:is()` pseudo-class.
 */
function createIsPseudoClass(selectors) {
	return {
		type: "PseudoClassSelector",
		name: "is",
		children: [
			{
				type: "SelectorList",
				children: selectors.map(
					selector =>
						/** @type {SelectorPlain} */ ({
							type: "Selector",
							children: selector,
						}),
				),
			},
		],
	};
}

/**
 * Replaces `&` in a compound selector.
 * @param {CssNodePlain[]} compound The compound selector.
 * @param {ComplexSelector[]} parents The selectors of the parent rule.
 * @param {boolean} isFirst Whether the compound selector is the first one in
 * a complex selector that is not relative.
 * @returns {CssNodePlain[]} The nodes that replace the compound selector.
 */
function replaceNestingInCompound(compound, parents, isFirst) {
	// eslint-disable-next-line no-use-before-define -- Recursive selector structure.
	const nodes = compound.map(node => replaceNestingInPseudo(node, parents));

	if (!nodes.some(isNestingSelector)) {
		return nodes;
	}

	if (parents.length === 1) {
		const [parent] = parents;
		const lastCompoundStart = getLastCompoundStart(parent);
		const lastCompound = parent.slice(lastCompoundStart);
		const nestingCount = nodes.filter(isNestingSelector).length;
		const typeSelectorCount =
			nodes.filter(isTypeSelector).length +
			nestingCount * lastCompound.filter(isTypeSelector).length;

		/*
		 * `:is(.a .b) .c` and `.a .b .c` have the same meaning, but
		 * `.c :is(.a .b)` and `.c .a .b` do not. Thus, a complex parent
		 * selector can replace `&` only in the first compound selector.
		 * It can replace only one `&` there, because each `&` adds the
		 * specificity of the full parent selector. A compound selector can
		 * contain only one type selector, and `&` cannot represent
		 * pseudo-elements.
		 */
		if (
			(lastCompoundStart === 0 || (isFirst && nestingCount === 1)) &&
			typeSelectorCount <= 1 &&
			!parent.some(isPseudoElementSelector)
		) {
			return [
				...parent.slice(0, lastCompoundStart),
				...nodes.flatMap(node =>
					isNestingSelector(node) ? lastCompound : [node],
				),
			];
		}
	}

	const pseudoClass = createIsPseudoClass(parents);

	return nodes.map(node => (isNestingSelector(node) ? pseudoClass : node));
}

/**
 * Replaces `&` in a complex selector.
 * @param {ComplexSelector} selector The complex selector.
 * @param {ComplexSelector[]} parents The selectors of the parent rule.
 * @param {boolean} isNonRelative Whether the complex selector is not relative.
 * @returns {ComplexSelector} The complex selector without `&`.
 */
function replaceNesting(selector, parents, isNonRelative) {
	return splitCompounds(selector).flatMap(
		({ combinator, compound }, index) => {
			const nodes = replaceNestingInCompound(
				compound,
				parents,
				isNonRelative && index === 0,
			);

			return combinator ? [combinator, ...nodes] : nodes;
		},
	);
}

/**
 * Replaces `&` in an argument of a pseudo-class or a pseudo-element.
 * @param {CssNodePlain} node The argument.
 * @param {ComplexSelector[]} parents The selectors of the parent rule.
 * @param {boolean} isNonRelative Whether the selectors in the argument are not relative.
 * @returns {CssNodePlain} The argument without `&`.
 */
function replaceNestingInArgument(node, parents, isNonRelative) {
	switch (node.type) {
		case "SelectorList":
			return {
				...node,
				children: node.children.map(child =>
					replaceNestingInArgument(child, parents, isNonRelative),
				),
			};

		case "Selector":
			return {
				...node,
				children: replaceNesting(node.children, parents, isNonRelative),
			};

		case "Nth":
			return node.selector
				? {
						...node,
						selector: /** @type {SelectorListPlain} */ (
							replaceNestingInArgument(
								node.selector,
								parents,
								isNonRelative,
							)
						),
					}
				: node;

		default:
			return node;
	}
}

/**
 * Replaces `&` in the arguments of a pseudo-class or a pseudo-element.
 * @param {CssNodePlain} node The simple selector.
 * @param {ComplexSelector[]} parents The selectors of the parent rule.
 * @returns {CssNodePlain} The simple selector without `&`.
 */
function replaceNestingInPseudo(node, parents) {
	if (
		(node.type !== "PseudoClassSelector" &&
			node.type !== "PseudoElementSelector") ||
		!node.children ||
		!containsNode(node, isNestingSelector)
	) {
		return node;
	}

	const isNonRelative =
		node.type === "PseudoClassSelector" &&
		nonRelativeArgumentPseudoClasses.has(node.name.toLowerCase());

	return {
		...node,
		children: node.children.map(child =>
			replaceNestingInArgument(child, parents, isNonRelative),
		),
	};
}

/**
 * Makes a nested selector absolute, as the CSS Nesting specification defines.
 * If the selector starts with a combinator, `&` goes before it. If the
 * selector does not contain `&`, `&` and a descendant combinator go before it.
 * @param {ComplexSelector} selector The nested selector.
 * @param {boolean} isScopeRoot Whether `&` refers to the scoping root of
 * `@scope`. In this case, `:scope` also makes a selector absolute.
 * @returns {ComplexSelector} The absolute selector.
 */
function absolutizeSelector(selector, isScopeRoot) {
	if (selector[0].type === "Combinator") {
		return [nestingSelector, ...selector];
	}

	const test = isScopeRoot ? isNestingOrScopeSelector : isNestingSelector;

	if (selector.some(node => containsNode(node, test))) {
		return selector;
	}

	return [nestingSelector, descendantCombinator, ...selector];
}

/**
 * Resolves a selector of a style rule. In the resolved selector, the
 * selectors of the parent rule replace `&`.
 * @param {SelectorPlain} selector The selector to resolve.
 * @param {ParentRule | null} parent The parent rule, or `null` if the style
 * rule is not nested.
 * @returns {ComplexSelector} The resolved selector.
 */
function resolveSelector(selector, parent) {
	if (!parent) {
		return selector.children;
	}

	return replaceNesting(
		absolutizeSelector(selector.children, parent.isScopeRoot),
		parent.selectors,
		true,
	);
}

/**
 * Joins the comparison texts of the selectors in a list. The order of the
 * selectors and duplicate selectors do not change the result.
 * @param {string[]} texts The comparison texts of the selectors.
 * @returns {string} The comparison text of the list.
 */
function joinSelectorTexts(texts) {
	return [...new Set(texts)].sort().join(",");
}

/**
 * Creates the comparison text of a simple selector.
 * @param {CssNodePlain} node The simple selector.
 * @returns {string} The comparison text.
 */
function serializeSimpleSelector(node) {
	if (
		(node.type === "PseudoClassSelector" ||
			node.type === "PseudoElementSelector") &&
		node.children?.some(
			child =>
				child.type === "SelectorList" ||
				child.type === "Selector" ||
				child.type === "Nth",
		)
	) {
		const prefix = node.type === "PseudoClassSelector" ? ":" : "::";

		// eslint-disable-next-line no-use-before-define -- Recursive selector structure.
		return `${prefix}${node.name}(${node.children.map(serializeArgument).join("")})`;
	}

	return generate(node);
}

/**
 * Creates the comparison text of a compound selector. The order of the simple
 * selectors before a pseudo-element does not change the result.
 * @param {CssNodePlain[]} compound The compound selector.
 * @returns {string} The comparison text.
 */
function serializeCompound(compound) {
	const pseudoElementIndex = compound.findIndex(isPseudoElementSelector);
	const end =
		pseudoElementIndex === -1 ? compound.length : pseudoElementIndex;
	const nodes = compound.slice(0, end);

	/*
	 * The type selector stays first. Otherwise, the texts of `div.a` and
	 * `.adiv` are the same after the sort.
	 */
	return [
		...nodes.filter(isTypeSelector).map(serializeSimpleSelector),
		...nodes
			.filter(node => !isTypeSelector(node))
			.map(serializeSimpleSelector)
			.sort(),
		...compound.slice(end).map(serializeSimpleSelector),
	].join("");
}

/**
 * Creates the comparison text of a complex selector. Equivalent spellings of
 * a selector have the same comparison text.
 * @param {ComplexSelector} selector The complex selector.
 * @returns {string} The comparison text.
 */
function serializeSelector(selector) {
	/*
	 * An escape can end with a space, for example in `.\61 b` (the class
	 * `ab`). NUL characters around each combinator keep this space apart
	 * from a descendant combinator.
	 */
	return splitCompounds(selector)
		.map(
			({ combinator, compound }) =>
				(combinator ? `\u0000${combinator.name}\u0000` : "") +
				serializeCompound(compound),
		)
		.join("");
}

/**
 * Creates the comparison text of an argument of a pseudo-class or a
 * pseudo-element.
 * @param {CssNodePlain} node The argument.
 * @returns {string} The comparison text.
 */
function serializeArgument(node) {
	switch (node.type) {
		case "SelectorList":
			return joinSelectorTexts(
				node.children.map(selector =>
					serializeSelector(
						/** @type {SelectorPlain} */ (selector).children,
					),
				),
			);

		case "Selector":
			return serializeSelector(node.children);

		case "Nth":
			return node.selector
				? `${generate(node.nth)} of ${serializeArgument(node.selector)}`
				: generate(node.nth);

		default:
			return generate(node);
	}
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoDuplicateSelectorsRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		docs: {
			description: "Disallow duplicate selectors",
			dialects: ["CSS"],
			recommended: false,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-selectors.md",
		},

		messages: {
			duplicateSelector:
				"Unexpected duplicate selector '{{selector}}', first used at line {{line}}.",
		},
	},

	create(context) {
		const { sourceCode } = context;

		/** @type {string[]} */
		const atRuleKeys = [];

		/** @type {NestingContext[]} */
		const nestingContexts = [];

		/** @type {Map<string, number>} */
		const firstLines = new Map();

		let anonymousLayerCount = 0;

		/**
		 * Returns the state of the style rules in the current block.
		 * @returns {NestingContext} The state of the style rules.
		 */
		function getNestingContext() {
			return nestingContexts.at(-1) ?? { check: true, parent: null };
		}

		/**
		 * Returns the text of a selector for a message, without line breaks.
		 * @param {SelectorPlain} selector The selector.
		 * @returns {string} The text of the selector.
		 */
		function getSelectorText(selector) {
			return sourceCode.getText(selector).replace(lineBreakPattern, " ");
		}

		/**
		 * Returns the key of the conditions that an at-rule adds.
		 * @param {AtrulePlain} node The at-rule.
		 * @param {ParentRule | null} parent The parent rule of the at-rule.
		 * @returns {string} The key of the conditions.
		 */
		function getAtRuleKey(node, parent) {
			const name = node.name.toLowerCase();

			// Each anonymous `@layer` block is a different cascade layer.
			if (name === "layer" && !node.prelude) {
				return `@layer #${++anonymousLayerCount}`;
			}

			const key = node.prelude
				? `@${name} ${generate(node.prelude)}`
				: `@${name}`;

			/*
			 * The scoping root of a nested `@scope` rule depends on the parent rule.
			 * This code is inert until the following issue is fixed, because
			 * the parser does not support style rules in a nested `@scope` rule:
			 * https://github.com/eslint/csstree/issues/175
			 */
			if (name === "scope" && parent) {
				return `${key} ${joinSelectorTexts(parent.selectors.map(serializeSelector))}`;
			}

			return key;
		}

		return {
			Atrule(node) {
				const { check, parent } = getNestingContext();
				const name = node.name.toLowerCase();

				atRuleKeys.push(getAtRuleKey(node, parent));

				if (keyframesPattern.test(name)) {
					nestingContexts.push({ check: false, parent: null });
				} else if (name === "scope") {
					// In the body of `@scope`, `&` refers to the scoping root.
					nestingContexts.push({
						check,
						parent: {
							selectors: [[nestingSelector]],
							isScopeRoot: true,
						},
					});
				} else {
					nestingContexts.push({ check, parent });
				}
			},

			"Atrule:exit"() {
				atRuleKeys.pop();
				nestingContexts.pop();
			},

			Rule(node) {
				const { check, parent } = getNestingContext();

				// The nested selectors of an invalid selector list cannot be resolved.
				if (!check || node.prelude.type !== "SelectorList") {
					nestingContexts.push({ check: false, parent: null });
					return;
				}

				const selectors = /** @type {SelectorPlain[]} */ (
					node.prelude.children
				);
				const resolvedSelectors = selectors.map(selector =>
					resolveSelector(selector, parent),
				);
				const texts = resolvedSelectors.map(serializeSelector);

				/** @type {Map<string, SelectorPlain>} */
				const firstSelectors = new Map();

				texts.forEach((text, index) => {
					const firstSelector = firstSelectors.get(text);

					if (firstSelector) {
						context.report({
							loc: selectors[index].loc,
							messageId: "duplicateSelector",
							data: {
								selector: getSelectorText(selectors[index]),
								line: firstSelector.loc.start.line,
							},
						});
					} else {
						firstSelectors.set(text, selectors[index]);
					}
				});

				/*
				 * Authors use a `& {}` rule in a style rule to keep declarations
				 * after nested rules in source order. Thus, it is not a duplicate
				 * of its parent.
				 */
				const isBareNestingRule =
					sourceCode.getParent(sourceCode.getParent(node))?.type ===
						"Rule" &&
					selectors.every(
						selector =>
							selector.children.length === 1 &&
							isNestingSelector(selector.children[0]),
					);

				if (!isBareNestingRule) {
					const key = JSON.stringify([
						...atRuleKeys,
						joinSelectorTexts(texts),
					]);
					const firstLine = firstLines.get(key);

					if (firstLine === undefined) {
						firstLines.set(key, node.prelude.loc.start.line);
					} else {
						context.report({
							loc: node.prelude.loc,
							messageId: "duplicateSelector",
							data: {
								selector: selectors
									.map(getSelectorText)
									.join(", "),
								line: firstLine,
							},
						});
					}
				}

				nestingContexts.push({
					check: true,
					parent: {
						selectors: resolvedSelectors,
						isScopeRoot: false,
					},
				});
			},

			"Rule:exit"() {
				nestingContexts.pop();
			},
		};
	},
});
