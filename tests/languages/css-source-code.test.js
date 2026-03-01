/**
 * @fileoverview Tests for CSSSourceCode
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { CSSSourceCode } from "../../src/languages/css-source-code.js";
import { CSSLanguage } from "../../src/languages/css-language.js";
import { parse, toPlainObject } from "@eslint/css-tree";
import assert from "node:assert";
import dedent from "dedent";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("CSSSourceCode", () => {
	describe("constructor", () => {
		it("should create a CSSSourceCode instance", () => {
			const ast = {
				type: "StyleSheet",
				children: [
					{
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: [
								{
									type: "Selector",
									children: [
										{
											type: "TypeSelector",
											name: "a",
										},
									],
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					},
				],
			};
			const text = "a {}";
			const comments = [];
			const sourceCode = new CSSSourceCode({
				text,
				ast,
				comments,
			});

			assert.strictEqual(sourceCode.constructor.name, "CSSSourceCode");
			assert.strictEqual(sourceCode.ast, ast);
			assert.strictEqual(sourceCode.text, text);
			assert.strictEqual(sourceCode.comments, comments);
		});
	});

	describe("getText()", () => {
		it("should return the text of the source code", () => {
			const file = { body: "a {}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.strictEqual(sourceCode.getText(), file.body);
		});
	});

	describe("getLoc()", () => {
		it("should return the loc property of a node", () => {
			const loc = {
				start: {
					line: 1,
					column: 1,
					offset: 0,
				},
				end: {
					line: 1,
					column: 2,
					offset: 1,
				},
			};
			const ast = {
				type: "StyleSheet",
				children: [],
				loc,
			};
			const text = "{}";
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});

			assert.strictEqual(sourceCode.getLoc(ast), loc);
		});
	});

	describe("getLocFromIndex()", () => {
		it("should convert index to location correctly", () => {
			const file = {
				body: "a {\n  /*test*/\r\n/*test*/\r/*test*/\f/*test*/}",
				path: "test.css",
			};
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.getLocFromIndex(0), {
				line: 1,
				column: 1,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(1), {
				line: 1,
				column: 2,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(2), {
				line: 1,
				column: 3,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(3), {
				line: 1,
				column: 4,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(4), {
				line: 2,
				column: 1,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(5), {
				line: 2,
				column: 2,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(6), {
				line: 2,
				column: 3,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(7), {
				line: 2,
				column: 4,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(8), {
				line: 2,
				column: 5,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(9), {
				line: 2,
				column: 6,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(10), {
				line: 2,
				column: 7,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(11), {
				line: 2,
				column: 8,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(12), {
				line: 2,
				column: 9,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(13), {
				line: 2,
				column: 10,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(14), {
				line: 2,
				column: 11,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(15), {
				line: 2,
				column: 12,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(16), {
				line: 3,
				column: 1,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(17), {
				line: 3,
				column: 2,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(25), {
				line: 4,
				column: 1,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(26), {
				line: 4,
				column: 2,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(34), {
				line: 5,
				column: 1,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(35), {
				line: 5,
				column: 2,
			});
			assert.deepStrictEqual(sourceCode.getLocFromIndex(43), {
				line: 5,
				column: 10,
			});
		});
	});

	describe("getIndexFromLoc()", () => {
		it("should convert location to index correctly", () => {
			const file = {
				body: "a {\n  /*test*/\r\n/*test*/\r/*test*/\f/*test*/}",
				path: "test.css",
			};
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 1,
					column: 1,
				}),
				0,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 1,
					column: 2,
				}),
				1,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 1,
					column: 3,
				}),
				2,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 1,
					column: 4,
				}),
				3,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 1,
				}),
				4,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 2,
				}),
				5,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 3,
				}),
				6,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 4,
				}),
				7,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 5,
				}),
				8,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 6,
				}),
				9,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 7,
				}),
				10,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 8,
				}),
				11,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 9,
				}),
				12,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 10,
				}),
				13,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 11,
				}),
				14,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 2,
					column: 12,
				}),
				15,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 3,
					column: 1,
				}),
				16,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 3,
					column: 2,
				}),
				17,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 4,
					column: 1,
				}),
				25,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 4,
					column: 2,
				}),
				26,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 5,
					column: 1,
				}),
				34,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 5,
					column: 2,
				}),
				35,
			);
			assert.strictEqual(
				sourceCode.getIndexFromLoc({
					line: 5,
					column: 10,
				}),
				43,
			);
		});
	});

	describe("getRange()", () => {
		it("should return the range property of a node", () => {
			const loc = {
				start: {
					line: 1,
					column: 1,
					offset: 0,
				},
				end: {
					line: 1,
					column: 2,
					offset: 1,
				},
			};
			const ast = {
				type: "StyleSheet",
				children: [],
				loc,
			};
			const text = "{}";
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});

			assert.deepStrictEqual(sourceCode.getRange(ast), [0, 1]);
		});
	});

	describe("comments", () => {
		it("should contain an empty array when parsing CSS without comments", () => {
			const file = { body: "a {}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
				comments: parseResult.comments,
			});

			assert.deepStrictEqual(sourceCode.comments, []);
		});

		it("should contain an array of comments when parsing CSS with comments", () => {
			const file = { body: "a {\n/*test*/\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
				comments: parseResult.comments,
			});

			// should contain one comment
			assert.strictEqual(sourceCode.comments.length, 1);

			const comment = sourceCode.comments[0];
			assert.strictEqual(comment.type, "Comment");
			assert.strictEqual(comment.value, "test");
			assert.deepStrictEqual(comment.loc, {
				source: "test.css",
				start: { line: 2, column: 1, offset: 4 },
				end: { line: 2, column: 9, offset: 12 },
			});
		});
	});

	describe("lines", () => {
		it("should split lines on LF line endings", () => {
			const file = { body: "a {\n/*test*/\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, ["a {", "/*test*/", "}"]);
		});

		it("should split lines on CR line endings", () => {
			const file = { body: "a {\r/*test*/\r}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, ["a {", "/*test*/", "}"]);
		});

		it("should split lines on FF line endings", () => {
			const file = { body: "a {\f/*test*/\f}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, ["a {", "/*test*/", "}"]);
		});

		it("should split lines on CRLF line endings", () => {
			const file = { body: "a {\r\n/*test*/\r\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, ["a {", "/*test*/", "}"]);
		});

		it("should split lines with mixed line endings (LF, CRLF, CR, FF)", () => {
			const file = {
				body: "a {\n/*one*/\r\n/*two*/\r/*three*/\f}",
				path: "test.css",
			};
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, [
				"a {",
				"/*one*/",
				"/*two*/",
				"/*three*/",
				"}",
			]);
		});
	});

	describe("getParent()", () => {
		it("should return the parent node for a given node", () => {
			const ast = {
				type: "StyleSheet",
				children: [
					{
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: [
								{
									type: "Selector",
									children: [
										{
											type: "TypeSelector",
											name: "a",
										},
									],
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					},
				],
			};
			const text = "a {}";
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});
			const node = ast.children[0];

			// call traverse to initialize the parent map
			sourceCode.traverse();

			assert.strictEqual(sourceCode.getParent(node).type, ast.type);
		});

		it("should return the parent node for a deeply nested node", () => {
			const ast = {
				type: "StyleSheet",
				children: [
					{
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: [
								{
									type: "Selector",
									children: [
										{
											type: "TypeSelector",
											name: "a",
										},
									],
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					},
				],
			};
			const text = '{"foo":{}}';
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});
			const node = ast.children[0].prelude.children[0].children[0];

			// call traverse to initialize the parent map
			sourceCode.traverse();

			assert.strictEqual(
				sourceCode.getParent(node),
				ast.children[0].prelude.children[0],
			);
		});
	});

	describe("getAncestors()", () => {
		it("should return an array of ancestors for a given node", () => {
			const ast = {
				type: "StyleSheet",
				children: [
					{
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: [
								{
									type: "Selector",
									children: [
										{
											type: "TypeSelector",
											name: "a",
										},
									],
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					},
				],
			};
			const text = "a {}";
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});
			const node = ast.children[0];

			// call traverse to initialize the parent map
			sourceCode.traverse();

			assert.deepStrictEqual(sourceCode.getAncestors(node), [ast]);
		});

		it("should return an array of ancestors for a deeply nested node", () => {
			const ast = {
				type: "StyleSheet",
				children: [
					{
						type: "Rule",
						prelude: {
							type: "SelectorList",
							children: [
								{
									type: "Selector",
									children: [
										{
											type: "TypeSelector",
											name: "a",
										},
									],
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					},
				],
			};
			const text = "a {}";
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});
			const node = ast.children[0].prelude.children[0].children[0];

			// call traverse to initialize the parent map
			sourceCode.traverse();

			assert.deepStrictEqual(sourceCode.getAncestors(node), [
				ast,
				ast.children[0],
				ast.children[0].prelude,
				ast.children[0].prelude.children[0],
			]);
		});
	});

	describe("config comments", () => {
		const text = dedent`

			/* rule config comments */
			/* eslint css/no-duplicate-selectors: error */
			.foo .bar {}
			
			/* eslint-disable css/no-duplicate-selectors -- ok here */
			/* eslint-enable */

			/* invalid rule config comments */
			/* eslint css/no-duplicate-selectors: [error */
			/*eslint css/no-duplicate-selectors: [1, { allow: ["foo"] ]*/

			/* eslint-disable-next-line css/no-duplicate-selectors */

			/* eslint-disable-line css/no-duplicate-selectors -- ok here */

			/* invalid disable directives */
			/* eslint-disable-line css/no-duplicate-selectors
			*/

			/* not disable directives */
			/*eslint-disable-*/

			/* eslint css/no-empty: [1] */
		`;

		let sourceCode = null;

		beforeEach(() => {
			const file = { body: text, path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
				comments: parseResult.comments,
			});
		});

		afterEach(() => {
			sourceCode = null;
		});

		describe("getInlineConfigNodes()", () => {
			it("should return inline config comments", () => {
				const allComments = sourceCode.comments;
				const configComments = sourceCode.getInlineConfigNodes();

				const configCommentsIndexes = [1, 2, 3, 5, 6, 7, 8, 10, 13];

				assert.strictEqual(
					configComments.length,
					configCommentsIndexes.length,
				);

				configComments.forEach((configComment, i) => {
					assert.strictEqual(
						configComment,
						allComments[configCommentsIndexes[i]],
					);
				});
			});
		});

		describe("applyInlineConfig()", () => {
			it("should return rule configs and problems", () => {
				const allComments = sourceCode.comments;
				const { configs, problems } = sourceCode.applyInlineConfig();

				assert.deepStrictEqual(configs, [
					{
						config: {
							rules: {
								"css/no-duplicate-selectors": "error",
							},
						},
						loc: allComments[1].loc,
					},
					{
						config: {
							rules: {
								"css/no-empty": [1],
							},
						},
						loc: allComments[13].loc,
					},
				]);

				assert.strictEqual(problems.length, 2);
				assert.strictEqual(problems[0].ruleId, null);
				assert.match(problems[0].message, /Failed to parse/u);
				assert.strictEqual(problems[0].loc, allComments[5].loc);
				assert.strictEqual(problems[1].ruleId, null);
				assert.match(problems[1].message, /Failed to parse/u);
				assert.strictEqual(problems[1].loc, allComments[6].loc);
			});
		});

		describe("getDisableDirectives()", () => {
			it("should return disable directives and problems", () => {
				const allComments = sourceCode.comments;
				const { directives, problems } =
					sourceCode.getDisableDirectives();

				assert.deepStrictEqual(
					directives.map(obj => ({ ...obj })),
					[
						{
							type: "disable",
							value: "css/no-duplicate-selectors",
							justification: "ok here",
							node: allComments[2],
						},
						{
							type: "enable",
							value: "",
							justification: "",
							node: allComments[3],
						},
						{
							type: "disable-next-line",
							value: "css/no-duplicate-selectors",
							justification: "",
							node: allComments[7],
						},
						{
							type: "disable-line",
							value: "css/no-duplicate-selectors",
							justification: "ok here",
							node: allComments[8],
						},
					],
				);

				assert.strictEqual(problems.length, 1);
				assert.strictEqual(problems[0].ruleId, null);
				assert.strictEqual(
					problems[0].message,
					"eslint-disable-line comment should not span multiple lines.",
				);
				assert.strictEqual(problems[0].loc, allComments[10].loc);
			});
		});
	});

	describe("traverse()", () => {
		const css = dedent`

		body {
			margin: 0;
			font-family: Arial, sans-serif;
		}

		nav a:hover {
			background-color: #555;
			padding: 10px 0;
		}`;

		it("should traverse the AST", () => {
			const sourceCode = new CSSSourceCode({
				text: css,
				ast: toPlainObject(parse(css, { positions: true })),
			});
			const steps = sourceCode.traverse();
			const stepsArray = Array.from(steps).map(step => [
				step.phase,
				step.target.type,
			]);

			assert.deepStrictEqual(stepsArray, [
				[1, "StyleSheet"],
				[1, "Rule"],
				[1, "SelectorList"],
				[1, "Selector"],
				[1, "TypeSelector"],
				[2, "TypeSelector"],
				[2, "Selector"],
				[2, "SelectorList"],
				[1, "Block"],
				[1, "Declaration"],
				[1, "Value"],
				[1, "Number"],
				[2, "Number"],
				[2, "Value"],
				[2, "Declaration"],
				[1, "Declaration"],
				[1, "Value"],
				[1, "Identifier"],
				[2, "Identifier"],
				[1, "Operator"],
				[2, "Operator"],
				[1, "Identifier"],
				[2, "Identifier"],
				[2, "Value"],
				[2, "Declaration"],
				[2, "Block"],
				[2, "Rule"],
				[1, "Rule"],
				[1, "SelectorList"],
				[1, "Selector"],
				[1, "TypeSelector"],
				[2, "TypeSelector"],
				[1, "Combinator"],
				[2, "Combinator"],
				[1, "TypeSelector"],
				[2, "TypeSelector"],
				[1, "PseudoClassSelector"],
				[2, "PseudoClassSelector"],
				[2, "Selector"],
				[2, "SelectorList"],
				[1, "Block"],
				[1, "Declaration"],
				[1, "Value"],
				[1, "Hash"],
				[2, "Hash"],
				[2, "Value"],
				[2, "Declaration"],
				[1, "Declaration"],
				[1, "Value"],
				[1, "Dimension"],
				[2, "Dimension"],
				[1, "Number"],
				[2, "Number"],
				[2, "Value"],
				[2, "Declaration"],
				[2, "Block"],
				[2, "Rule"],
				[2, "StyleSheet"],
			]);
		});
	});

	describe("Custom property tracking", () => {
		/**
		 * Helper to create a CSSSourceCode instance from CSS text.
		 * @param {string} text The CSS source text.
		 * @returns {import("../../src/languages/css-source-code.js").CSSSourceCode} The CSSSourceCode instance.
		 */
		function createSourceCode(text) {
			const sourceCode = new CSSSourceCode({
				text,
				ast: toPlainObject(parse(text, { positions: true })),
			});
			// trigger traversal to populate custom property data
			sourceCode.traverse();
			return sourceCode;
		}

		/**
		 * Helper to find all nodes of a given type in the AST.
		 * @param {Object} node The root node.
		 * @param {string} type The node type to search for.
		 * @param {Function} [filter] Optional filter function.
		 * @returns {Array<Object>} Matching nodes.
		 */
		function findNodes(node, type, filter) {
			const results = [];
			(function walk(n) {
				if (n.type === type && (!filter || filter(n))) {
					results.push(n);
				}
				for (const key of ["children", "prelude", "block", "value"]) {
					const child = n[key];
					if (child) {
						if (Array.isArray(child)) {
							child.forEach(walk);
						} else if (typeof child === "object" && child.type) {
							walk(child);
						}
					}
				}
			})(node);
			return results;
		}

		describe("getDeclarationVariables()", () => {
			it("should return var() functions used in a declaration", () => {
				const sourceCode = createSourceCode(
					":root { --my-color: red; }\na { color: var(--my-color); }",
				);
				const declarations = findNodes(
					sourceCode.ast,
					"Declaration",
					n => n.property === "color",
				);

				const vars = sourceCode.getDeclarationVariables(
					declarations[0],
				);
				assert.strictEqual(vars.length, 1);
				assert.strictEqual(vars[0].type, "Function");
				assert.strictEqual(vars[0].name, "var");
			});

			it("should return multiple var() functions in one declaration", () => {
				const sourceCode = createSourceCode(
					":root { --a: 1px; --b: solid; }\na { border: var(--a) var(--b) red; }",
				);
				const declarations = findNodes(
					sourceCode.ast,
					"Declaration",
					n => n.property === "border",
				);

				const vars = sourceCode.getDeclarationVariables(
					declarations[0],
				);
				assert.strictEqual(vars.length, 2);
			});

			it("should return empty array for declarations without var()", () => {
				const sourceCode = createSourceCode("a { color: red; }");
				const declarations = findNodes(
					sourceCode.ast,
					"Declaration",
					n => n.property === "color",
				);

				const vars = sourceCode.getDeclarationVariables(
					declarations[0],
				);
				assert.strictEqual(vars.length, 0);
			});

			it("should return empty array for unknown declarations", () => {
				const sourceCode = createSourceCode("a { color: red; }");
				const vars = sourceCode.getDeclarationVariables({});
				assert.strictEqual(vars.length, 0);
			});
		});

		describe("getClosestVariableValue()", () => {
			it("should return the value from the same rule block", () => {
				const sourceCode = createSourceCode(
					"a { --my-color: red; color: var(--my-color); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const value = sourceCode.getClosestVariableValue(varFuncs[0]);
				assert.ok(value);
				assert.strictEqual(value.type, "Raw");
				assert.strictEqual(value.value.trim(), "red");
			});

			it("should return the fallback when no same-block declaration exists", () => {
				const sourceCode = createSourceCode(
					"a { color: var(--my-color, blue); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const value = sourceCode.getClosestVariableValue(varFuncs[0]);
				assert.ok(value);
				assert.strictEqual(value.type, "Raw");
				assert.ok(value.value.includes("blue"));
			});

			it("should return the value from a previous rule", () => {
				const sourceCode = createSourceCode(
					":root { --my-color: red; }\na { color: var(--my-color); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const value = sourceCode.getClosestVariableValue(varFuncs[0]);
				assert.ok(value);
				assert.strictEqual(value.type, "Raw");
				assert.strictEqual(value.value.trim(), "red");
			});

			it("should return @property initial-value as last resort", () => {
				const css =
					'@property --my-color { syntax: "*"; inherits: false; initial-value: green; }\na { color: var(--my-color); }';
				const sourceCode = createSourceCode(css);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const value = sourceCode.getClosestVariableValue(varFuncs[0]);
				assert.ok(value);
			});

			it("should return undefined when no value can be found", () => {
				const sourceCode = createSourceCode(
					"a { color: var(--unknown); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const value = sourceCode.getClosestVariableValue(varFuncs[0]);
				assert.strictEqual(value, undefined);
			});

			it("should accept a string name and return the last declaration value", () => {
				const sourceCode = createSourceCode(
					":root { --my-color: red; }\n.foo { --my-color: blue; }",
				);

				const value = sourceCode.getClosestVariableValue("--my-color");
				assert.ok(value);
				assert.strictEqual(value.type, "Raw");
				assert.strictEqual(value.value.trim(), "blue");
			});

			it("should return undefined for unknown name string", () => {
				const sourceCode = createSourceCode("a { color: red; }");
				const value = sourceCode.getClosestVariableValue("--unknown");
				assert.strictEqual(value, undefined);
			});
		});

		describe("getVariableValues()", () => {
			it("should return all declaration values in source order", () => {
				const sourceCode = createSourceCode(
					":root { --c: red; }\n.foo { --c: blue; }\na { color: var(--c); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const values = sourceCode.getVariableValues(varFuncs[0]);
				assert.strictEqual(values.length, 2);
				assert.strictEqual(values[0].value.trim(), "red");
				assert.strictEqual(values[1].value.trim(), "blue");
			});

			it("should include @property initial-value first", () => {
				const css =
					'@property --c { syntax: "*"; inherits: false; initial-value: green; }\n:root { --c: red; }\na { color: var(--c); }';
				const sourceCode = createSourceCode(css);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const values = sourceCode.getVariableValues(varFuncs[0]);
				assert.strictEqual(values.length, 2);

				// First value is from @property initial-value (a Value node)
				assert.strictEqual(values[0].type, "Value");

				// Second is from :root declaration (a Raw node)
				assert.strictEqual(values[1].type, "Raw");
			});

			it("should include fallback value last", () => {
				const sourceCode = createSourceCode(
					":root { --c: red; }\na { color: var(--c, blue); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const values = sourceCode.getVariableValues(varFuncs[0]);
				assert.strictEqual(values.length, 2);
				assert.strictEqual(values[0].value.trim(), "red");
				assert.ok(values[1].value.includes("blue"));
			});

			it("should include declarations after the var() reference (hoisting)", () => {
				const sourceCode = createSourceCode(
					"a { color: var(--c); }\n:root { --c: red; }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const values = sourceCode.getVariableValues(varFuncs[0]);
				assert.strictEqual(values.length, 1);
				assert.strictEqual(values[0].value.trim(), "red");
			});

			it("should return empty array for unknown variables without fallback", () => {
				const sourceCode = createSourceCode(
					"a { color: var(--unknown); }",
				);
				const varFuncs = findNodes(
					sourceCode.ast,
					"Function",
					n => n.name === "var",
				);

				const values = sourceCode.getVariableValues(varFuncs[0]);
				assert.strictEqual(values.length, 0);
			});
		});
	});
});
