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

/**
 * @import { CssNode, CssNodePlain, CssLocationRange, Comment, Lexer, StyleSheetPlain, DeclarationPlain, AtrulePlain, FunctionNodePlain, ValuePlain, Raw } from "@eslint/css-tree"
 * @import { SourceRange, FileProblem, DirectiveType, RulesConfig } from "@eslint/core"
 * @import { CSSSyntaxElement } from "../types.js"
 * @import { CSSLanguageOptions } from "./css-language.js"
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const commentParser = new ConfigCommentParser();

const INLINE_CONFIG =
	/^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

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
 * CSS Source Code Object.
 * @extends {TextSourceCodeBase<{LangOptions: CSSLanguageOptions, RootNode: StyleSheetPlain, SyntaxElementWithLoc: CSSSyntaxElement, ConfigNode: Comment}>}
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
	 * @type {StyleSheetPlain}
	 */
	ast = undefined;

	/**
	 * The comment node in the source code.
	 * @type {Array<Comment>|undefined}
	 */
	comments;

	/**
	 * The lexer for this instance.
	 * @type {Lexer}
	 */
	lexer;

	/**
	 * Map of custom property names to their uses.
	 * @type {Map<string, {declarations: Array<DeclarationPlain>, definitions: Array<AtrulePlain>, references: Array<FunctionNodePlain>}>}
	 */
	#customProperties = new Map();

	/**
	 * Map of declaration nodes to the var() function nodes they contain.
	 * @type {WeakMap<DeclarationPlain, Array<FunctionNodePlain>>}
	 */
	#declarationVariables = new WeakMap();

	/**
	 * Creates a new instance.
	 * @param {Object} options The options for the instance.
	 * @param {string} options.text The source code text.
	 * @param {StyleSheetPlain} options.ast The root AST node.
	 * @param {Array<Comment>} options.comments The comment nodes in the source code.
	 * @param {Lexer} options.lexer The lexer used to parse the source code.
	 */
	constructor({ text, ast, comments, lexer }) {
		super({ text, ast, lineEndingPattern: /\r\n|[\r\n\f]/u });
		this.ast = ast;
		this.comments = comments;
		this.lexer = lexer;
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
		/** @type {Array<FileProblem>} */
		const problems = [];
		/** @type {Array<Directive>} */
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
	 * @returns {{problems:Array<FileProblem>,configs:Array<{config:{rules:RulesConfig},loc:CssLocationRange}>}} Information
	 *      that ESLint needs to further process the rule configurations.
	 */
	applyInlineConfig() {
		/** @type {Array<FileProblem>} */
		const problems = [];
		/** @type {Array<{config:{rules:RulesConfig},loc:CssLocationRange}>} */
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
	 * Returns the var() function nodes used in a declaration's value.
	 * @param {DeclarationPlain} declaration The declaration node.
	 * @returns {Array<FunctionNodePlain>} The var() function nodes.
	 */
	getDeclarationVariables(declaration) {
		return this.#declarationVariables.get(declaration) || [];
	}

	/**
	 * Returns the closest variable value for a var() function node.
	 * @param {FunctionNodePlain} func The var() function node.
	 * @returns {ValuePlain|Raw|undefined} The closest variable value.
	 */
	getClosestVariableValue(func) {
		const varName = /** @type {{name: string}} */ (func.children[0]).name;
		const uses = this.#customProperties.get(varName);

		// Step 1: Check if the current rule block has a declaration for this variable
		const funcParent = this.#parents.get(func);
		let current = funcParent;

		while (current) {
			if (current.type === "Block") {
				break;
			}
			current = this.#parents.get(current);
		}

		if (current && current.type === "Block" && uses) {
			// Find declarations in the same block
			const blockDecls = uses.declarations.filter(decl => {
				let declParent = this.#parents.get(decl);

				while (declParent) {
					if (declParent === current) {
						return true;
					}
					declParent = this.#parents.get(declParent);
				}
				return false;
			});

			if (blockDecls.length > 0) {
				return blockDecls.at(-1).value;
			}
		}

		// Step 2: Check if var() has a fallback value
		if (func.children.length >= 3 && func.children[2]) {
			return /** @type {Raw} */ (func.children[2]);
		}

		// Step 3: Check previous rules for a declaration
		if (uses) {
			const funcOffset = func.loc.start.offset;

			// Find the last declaration before this var() usage
			const previousDecls = uses.declarations.filter(
				decl => decl.loc.start.offset < funcOffset,
			);

			if (previousDecls.length > 0) {
				return previousDecls.at(-1).value;
			}

			// Also check declarations after the var() usage (hoisting)
			if (uses.declarations.length > 0) {
				return uses.declarations.at(-1).value;
			}
		}

		// Step 4: Check @property definitions for initial-value
		if (uses) {
			for (const definition of uses.definitions) {
				if (definition.block && definition.block.children) {
					for (const decl of definition.block.children) {
						if (
							decl.type === "Declaration" &&
							decl.property === "initial-value"
						) {
							return decl.value;
						}
					}
				}
			}
		}

		// Step 5: return undefined
		return undefined;
	}

	/**
	 * Returns all declared values for a var() function node's custom property.
	 * @param {FunctionNodePlain} func The var() function node.
	 * @returns {Array<Raw|ValuePlain>} The declared values.
	 */
	getVariableValues(func) {
		const varName = /** @type {{name: string}} */ (func.children[0]).name;
		const uses = this.#customProperties.get(varName);
		const result = [];

		// Step 1: @property initial-value comes first
		if (uses) {
			for (const definition of uses.definitions) {
				if (definition.block && definition.block.children) {
					for (const decl of definition.block.children) {
						if (
							decl.type === "Declaration" &&
							decl.property === "initial-value"
						) {
							result.push(decl.value);
						}
					}
				}
			}
		}

		// Step 2: Declaration values in source order
		if (uses) {
			for (const decl of uses.declarations) {
				result.push(decl.value);
			}
		}

		// Step 3: Fallback value last
		if (func.children.length >= 3 && func.children[2]) {
			result.push(/** @type {Raw} */ (func.children[2]));
		}

		return result;
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

		/**
		 * Stack to track the current declaration being visited for
		 * collecting var() references in declarations.
		 * @type {Array<DeclarationPlain>}
		 */
		const declarationStack = [];

		// Note: We can't use `walk` from `css-tree` because it uses `CssNode` instead of `CssNodePlain`

		const visit = (node, parent) => {
			// first set the parent
			this.#parents.set(node, parent);

			// Track custom property declarations (e.g., --my-color: red)
			if (node.type === "Declaration" && node.property.startsWith("--")) {
				const varName = node.property;
				let uses = this.#customProperties.get(varName);

				if (!uses) {
					uses = {
						declarations: [],
						definitions: [],
						references: [],
					};
					this.#customProperties.set(varName, uses);
				}
				uses.declarations.push(node);
			}

			// Track @property definitions
			if (
				node.type === "Atrule" &&
				node.name.toLowerCase() === "property" &&
				node.prelude &&
				node.prelude.children &&
				node.prelude.children.length > 0
			) {
				const propName = node.prelude.children[0].name;

				if (propName) {
					let uses = this.#customProperties.get(propName);

					if (!uses) {
						uses = {
							declarations: [],
							definitions: [],
							references: [],
						};
						this.#customProperties.set(propName, uses);
					}
					uses.definitions.push(node);
				}
			}

			// Track declaration enter for var() collection
			if (node.type === "Declaration") {
				declarationStack.push(node);
			}

			// Track var() references
			if (
				node.type === "Function" &&
				node.name.toLowerCase() === "var" &&
				node.children &&
				node.children.length > 0 &&
				node.children[0].type === "Identifier"
			) {
				const varName = node.children[0].name;
				let uses = this.#customProperties.get(varName);

				if (!uses) {
					uses = {
						declarations: [],
						definitions: [],
						references: [],
					};
					this.#customProperties.set(varName, uses);
				}
				uses.references.push(node);

				// Also track which declarations contain var() references
				const currentDecl = declarationStack.at(-1);

				if (currentDecl) {
					let varRefs = this.#declarationVariables.get(currentDecl);

					if (!varRefs) {
						varRefs = [];
						this.#declarationVariables.set(currentDecl, varRefs);
					}
					varRefs.push(node);
				}
			}

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

			// Track declaration exit
			if (node.type === "Declaration") {
				declarationStack.pop();
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
