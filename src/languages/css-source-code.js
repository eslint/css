/**
 * @fileoverview The CSSSourceCode class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	VisitNodeStep,
	TextSourceCodeBase,
	ConfigCommentParser,
	Directive,
} from "@eslint/plugin-kit";
import { visitorKeys } from "./css-visitor-keys.js";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").CssNode} CssNode */
/** @typedef {import("css-tree").CssNodePlain} CssNodePlain */
/** @typedef {import("css-tree").BlockPlain} BlockPlain */
/** @typedef {import("css-tree").Comment} Comment */
/** @typedef {import("@eslint/core").SourceRange} SourceRange */
/** @typedef {import("@eslint/core").SourceLocation} SourceLocation */
/** @typedef {import("@eslint/core").SourceLocationWithOffset} SourceLocationWithOffset */
/** @typedef {import("@eslint/core").File} File */
/** @typedef {import("@eslint/core").TraversalStep} TraversalStep */
/** @typedef {import("@eslint/core").TextSourceCode} TextSourceCode */
/** @typedef {import("@eslint/core").VisitTraversalStep} VisitTraversalStep */
/** @typedef {import("@eslint/core").FileProblem} FileProblem */
/** @typedef {import("@eslint/core").DirectiveType} DirectiveType */
/** @typedef {import("@eslint/core").RulesConfig} RulesConfig */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();

const INLINE_CONFIG =
	/^\s*(?:eslint(?:-enable|-disable(?:(?:-next)?-line)?)?)(?:\s|$)/u;

/**
 * Asserts that the given node is a block node.
 * @param {CssNodePlain} node The node to check.
 * @throws {TypeError} When the node is not a block node.
 * @returns {void}
 */
function assertBlock(node) {
	if (node.type !== "Block") {
		throw new TypeError("Expected a block node.");
	}
}

/**
 * A class to represent a step in the traversal process.
 */
class CSSTraversalStep extends VisitNodeStep {
	/**
	 * The target of the step.
	 * @type {CssNode}
	 */
	target = undefined;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the step.
	 * @param {CssNode} options.target The target of the step.
	 * @param {1|2} options.phase The phase of the step.
	 * @param {Array<any>} options.args The arguments of the step.
	 */
	constructor({ target, phase, args }) {
		super({ target, phase, args });

		this.target = target;
	}
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * CSS Source Code Object
 */
export class CSSSourceCode extends TextSourceCodeBase {
	/**
	 * Cached traversal steps.
	 * @type {Array<CSSTraversalStep>|undefined}
	 */
	#steps;

	/**
	 * Cache of parent nodes.
	 * @type {WeakMap<CssNodePlain, CssNodePlain>}
	 */
	#parents = new WeakMap();

	/**
	 * Collection of inline configuration comments.
	 * @type {Array<Comment>}
	 */
	#inlineConfigComments;

	/**
	 * The AST of the source code.
	 * @type {CssNodePlain}
	 */
	ast = undefined;

	/**
	 * The comment node in the source code.
	 * @type {Array<Comment>|undefined}
	 */
	comments;

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.text The source code text.
	 * @param {CssNodePlain} options.ast The root AST node.
	 * @param {Array<Comment>} options.comments The comment nodes in the source code.
	 */
	constructor({ text, ast, comments }) {
		super({ text, ast });
		this.ast = ast;
		this.comments = comments;
	}

	/**
	 * Returns the range of the given node.
	 * @param {CssNodePlain} node The node to get the range of.
	 * @returns {SourceRange} The range of the node.
	 * @override
	 */
	getRange(node) {
		return [node.loc.start.offset, node.loc.end.offset];
	}

	/**
	 * Returns the location of the given node, expanding it to include the
	 * surrounding braces.
	 * @param {BlockPlain} block The node to get the location of.
	 * @returns {SourceLocationWithOffset} The location of the node.
	 * @throws {TypeError} When the node is not a block node.
	 */
	getBlockLocWithBraces(block) {
		assertBlock(block);

		const { start, end } = block.loc;

		return {
			start: {
				line: start.line,
				column: start.column - 1,
				offset: start.offset - 1,
			},
			end: {
				line: end.line,
				column: end.column + 1,
				offset: end.offset + 1,
			},
		};
	}

	/**
	 * Returns the range of the given node, expanding it to include the
	 * surrounding braces.
	 * @param {BlockPlain} block The node to get the range of.
	 * @returns {SourceRange} The range of the node.
	 * @throws {TypeError} When the node is not a block node.
	 */
	getBlockRangeWithBraces(block) {
		const loc = this.getBlockLocWithBraces(block);
		return [loc.start.offset, loc.end.offset];
	}

	/**
	 * Returns an array of all inline configuration nodes found in the
	 * source code.
	 * @returns {Array<Comment>} An array of all inline configuration nodes.
	 */
	getInlineConfigNodes() {
		if (!this.#inlineConfigComments) {
			this.#inlineConfigComments = this.comments.filter(comment =>
				INLINE_CONFIG.test(comment.value),
			);
		}

		return this.#inlineConfigComments;
	}

	/**
	 * Returns directives that enable or disable rules along with any problems
	 * encountered while parsing the directives.
	 * @returns {{problems:Array<FileProblem>,directives:Array<Directive>}} Information
	 *      that ESLint needs to further process the directives.
	 */
	getDisableDirectives() {
		const problems = [];
		const directives = [];

		this.getInlineConfigNodes().forEach(comment => {
			const { label, value, justification } =
				commentParser.parseDirective(comment.value);

			// `eslint-disable-line` directives are not allowed to span multiple lines as it would be confusing to which lines they apply
			if (
				label === "eslint-disable-line" &&
				comment.loc.start.line !== comment.loc.end.line
			) {
				const message = `${label} comment should not span multiple lines.`;

				problems.push({
					ruleId: null,
					message,
					loc: comment.loc,
				});
				return;
			}

			switch (label) {
				case "eslint-disable":
				case "eslint-enable":
				case "eslint-disable-next-line":
				case "eslint-disable-line": {
					const directiveType = label.slice("eslint-".length);

					directives.push(
						new Directive({
							type: /** @type {DirectiveType} */ (directiveType),
							node: comment,
							value,
							justification,
						}),
					);
				}

				// no default
			}
		});

		return { problems, directives };
	}

	/**
	 * Returns inline rule configurations along with any problems
	 * encountered while parsing the configurations.
	 * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:SourceLocation}>}} Information
	 *      that ESLint needs to further process the rule configurations.
	 */
	applyInlineConfig() {
		const problems = [];
		const configs = [];

		this.getInlineConfigNodes().forEach(comment => {
			const { label, value } = commentParser.parseDirective(
				comment.value,
			);

			if (label === "eslint") {
				const parseResult = commentParser.parseJSONLikeConfig(value);

				if (parseResult.ok) {
					configs.push({
						config: {
							rules: parseResult.config,
						},
						loc: comment.loc,
					});
				} else {
					problems.push({
						ruleId: null,
						message:
							/** @type {{ok: false, error: { message: string }}} */ (
								parseResult
							).error.message,
						loc: comment.loc,
					});
				}
			}
		});

		return {
			configs,
			problems,
		};
	}

	/**
	 * Returns the parent of the given node.
	 * @param {CssNodePlain} node The node to get the parent of.
	 * @returns {CssNodePlain|undefined} The parent of the node.
	 */
	getParent(node) {
		return this.#parents.get(node);
	}

	/**
	 * Traverse the source code and return the steps that were taken.
	 * @returns {Iterable<CSSTraversalStep>} The steps that were taken while traversing the source code.
	 */
	traverse() {
		// Because the AST doesn't mutate, we can cache the steps
		if (this.#steps) {
			return this.#steps.values();
		}

		/** @type {Array<CSSTraversalStep>} */
		const steps = (this.#steps = []);

		// Note: We can't use `walk` from `css-tree` because it uses `CssNode` instead of `CssNodePlain`

		const visit = (node, parent) => {
			// first set the parent
			this.#parents.set(node, parent);

			// then add the step
			steps.push(
				new CSSTraversalStep({
					target: node,
					phase: 1,
					args: [node, parent],
				}),
			);

			// then visit the children
			for (const key of visitorKeys[node.type] || []) {
				const child = node[key];

				if (child) {
					if (Array.isArray(child)) {
						child.forEach(grandchild => {
							visit(grandchild, node);
						});
					} else {
						visit(child, node);
					}
				}
			}

			// then add the exit step
			steps.push(
				new CSSTraversalStep({
					target: node,
					phase: 2,
					args: [node, parent],
				}),
			);
		};

		visit(this.ast);

		return steps;
	}
}
