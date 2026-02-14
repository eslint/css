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

/**
 * @typedef {Object} CustomPropertyUses
 * @property {Array<DeclarationPlain>} declarations Declaration nodes where the custom property value is declared.
 * @property {Array<AtrulePlain>} definitions Atrule nodes where the custom property is defined using `@property`.
 * @property {Array<FunctionNodePlain>} references Function nodes (`var()`) where the custom property is used.
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
	 * Map of custom property names to their uses.
	 * @type {Map<string, CustomPropertyUses>|undefined}
	 */
	#customProperties;

	/**
	 * Map of declarations to the var() functions they contain.
	 * @type {WeakMap<CssNodePlain, Array<FunctionNodePlain>>}
	 */
	#declarationVariables = new WeakMap();

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
	 * Ensures the custom properties map entry exists for a given name.
	 * @param {string} name The custom property name.
	 * @returns {CustomPropertyUses} The uses object.
	 */
	#ensureCustomProperty(name) {
		if (!this.#customProperties.has(name)) {
			this.#customProperties.set(name, {
				declarations: [],
				definitions: [],
				references: [],
			});
		}
		return this.#customProperties.get(name);
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
		this.#customProperties = new Map();

		// Note: We can't use `walk` from `css-tree` because it uses `CssNode` instead of `CssNodePlain`

		/**
		 * Stack of declaration nodes currently being visited.
		 * Used to track which var() functions belong to which declaration.
		 * @type {Array<CssNodePlain>}
		 */
		const declStack = [];

		const visit = (node, parent) => {
			// first set the parent
			this.#parents.set(node, parent);

			// Track custom property declarations
			if (node.type === "Declaration" && node.property.startsWith("--")) {
				this.#ensureCustomProperty(node.property).declarations.push(
					node,
				);
			}

			// Track @property definitions
			if (node.type === "Atrule" && node.name === "property") {
				const identNode = node.prelude?.children?.[0];
				if (
					identNode?.type === "Identifier" &&
					identNode.name.startsWith("--")
				) {
					this.#ensureCustomProperty(identNode.name).definitions.push(
						node,
					);
				}
			}

			// Track var() references
			if (node.type === "Function" && node.name.toLowerCase() === "var") {
				const identNode = node.children?.[0];
				if (
					identNode?.type === "Identifier" &&
					identNode.name.startsWith("--")
				) {
					this.#ensureCustomProperty(identNode.name).references.push(
						node,
					);
				}

				// Associate this var() with the current declaration
				if (declStack.length > 0) {
					const currentDecl = declStack.at(-1);
					const vars = this.#declarationVariables.get(currentDecl);
					if (vars) {
						vars.push(node);
					}
				}
			}

			// Track declaration context for getDeclarationVariables
			const isDeclaration = node.type === "Declaration";
			if (isDeclaration) {
				declStack.push(node);
				this.#declarationVariables.set(node, []);
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

			// Pop declaration context
			if (isDeclaration) {
				declStack.pop();
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

	/**
	 * Returns an array of `var()` function nodes used in the given declaration's value.
	 * @param {DeclarationPlain} declaration The declaration node to inspect.
	 * @returns {Array<FunctionNodePlain>} The `var()` function nodes found in the declaration.
	 */
	getDeclarationVariables(declaration) {
		// Ensure traversal has happened
		if (!this.#customProperties) {
			this.traverse();
		}

		return this.#declarationVariables.get(declaration) ?? [];
	}

	/**
	 * Returns the closest computed value for a `var()` function node or a
	 * custom property name.
	 *
	 * When called with a `var()` function node, the resolution order is:
	 * 1. If the current rule block has one or more custom property declarations
	 *    for the variable, return the value of the last one.
	 * 2. If the `var()` has a fallback value, return the fallback.
	 * 3. If a previous rule had a custom property declaration, return the last value.
	 * 4. If there's a `@property` with an `initial-value`, return the initial value.
	 * 5. Otherwise, return `undefined`.
	 *
	 * When called with a custom property name string, returns the last declared
	 * value for that property, or the `@property` initial-value if no
	 * declarations exist.
	 * @param {FunctionNodePlain|string} funcOrName The `var()` function node or custom property name.
	 * @returns {ValuePlain|Raw|undefined} The closest value node, or `undefined`.
	 */
	getClosestVariableValue(funcOrName) {
		// Ensure traversal has happened
		if (!this.#customProperties) {
			this.traverse();
		}

		// When called with a string name, return the last declaration value
		if (typeof funcOrName === "string") {
			const uses = this.#customProperties.get(funcOrName);

			if (uses && uses.declarations.length > 0) {
				return uses.declarations.at(-1).value;
			}

			// Fall back to @property initial-value
			if (uses) {
				for (const definition of uses.definitions) {
					const block = definition.block;
					if (block?.children) {
						for (const child of block.children) {
							if (
								child.type === "Declaration" &&
								child.property === "initial-value"
							) {
								return child.value;
							}
						}
					}
				}
			}

			return undefined;
		}

		const func = funcOrName;
		const identNode = func.children?.[0];
		if (!identNode || identNode.type !== "Identifier") {
			return undefined;
		}

		const varName = identNode.name;
		const uses = this.#customProperties.get(varName);

		// Find the enclosing Rule node for this var() function
		let ruleBlock = null;
		let ancestor = this.#parents.get(func);
		while (ancestor) {
			if (ancestor.type === "Rule") {
				ruleBlock = ancestor;
				break;
			}
			ancestor = this.#parents.get(ancestor);
		}

		// Step 1: Check current rule block for declarations
		if (ruleBlock && uses) {
			const blockDeclarations = uses.declarations.filter(decl => {
				let parent = this.#parents.get(decl);
				while (parent) {
					if (parent === ruleBlock) {
						return true;
					}
					if (parent.type === "Rule") {
						return false;
					}
					parent = this.#parents.get(parent);
				}
				return false;
			});

			if (blockDeclarations.length > 0) {
				return blockDeclarations.at(-1).value;
			}
		}

		// Step 2: Check fallback value
		if (func.children.length >= 3) {
			const fallback = func.children[2];
			if (fallback) {
				return /** @type {Raw} */ (fallback);
			}
		}

		// Step 3: Check declarations in previous rules
		if (uses) {
			const funcOffset = func.loc?.start?.offset ?? Infinity;
			const previousDeclarations = uses.declarations.filter(decl => {
				// Must not be in the same rule block (already checked)
				let parent = this.#parents.get(decl);
				while (parent) {
					if (parent === ruleBlock) {
						return false;
					}
					if (parent.type === "Rule") {
						break;
					}
					parent = this.#parents.get(parent);
				}
				return (decl.loc?.start?.offset ?? 0) < funcOffset;
			});

			if (previousDeclarations.length > 0) {
				return previousDeclarations.at(-1).value;
			}
		}

		// Step 4: Check @property initial-value
		if (uses) {
			for (const definition of uses.definitions) {
				const block = definition.block;
				if (block?.children) {
					for (const child of block.children) {
						if (
							child.type === "Declaration" &&
							child.property === "initial-value"
						) {
							return child.value;
						}
					}
				}
			}
		}

		// Step 5: Return undefined
		return undefined;
	}

	/**
	 * Returns all possible values for a `var()` function node.
	 *
	 * The returned array is composed of:
	 * 1. If there's a `@property` with an `initial-value`, that value comes first.
	 * 2. The values from custom property declarations throughout the file, in source order.
	 * 3. The fallback value (if present) comes last.
	 * @param {FunctionNodePlain} func The `var()` function node.
	 * @returns {Array<ValuePlain|Raw>} Array of value nodes.
	 */
	getVariableValues(func) {
		// Ensure traversal has happened
		if (!this.#customProperties) {
			this.traverse();
		}

		const identNode = func.children?.[0];
		if (!identNode || identNode.type !== "Identifier") {
			return [];
		}

		const varName = identNode.name;
		const uses = this.#customProperties.get(varName);

		/** @type {Array<ValuePlain|Raw>} */
		const values = [];

		if (uses) {
			// Step 1: @property initial-value first
			for (const definition of uses.definitions) {
				const block = definition.block;
				if (block?.children) {
					for (const child of block.children) {
						if (
							child.type === "Declaration" &&
							child.property === "initial-value"
						) {
							values.push(child.value);
						}
					}
				}
			}

			// Step 2: All declarations in source order
			for (const decl of uses.declarations) {
				values.push(decl.value);
			}
		}

		// Step 3: Fallback value last
		if (func.children.length >= 3) {
			const fallback = func.children[2];
			if (fallback) {
				values.push(/** @type {Raw} */ (fallback));
			}
		}

		return values;
	}
}
