/**
 * @fileoverview Tests for CSSSourceCode
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { CSSSourceCode } from "../../src/languages/css-source-code.js";
import { CSSLanguage } from "../../src/languages/css-language.js";
import { parse, toPlainObject } from "css-tree";
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
									]
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					}
				]
			};
			const text = "a {}";
			const comments = [];
			const sourceCode = new CSSSourceCode({
				text,
				ast,
				comments
			});

			assert.strictEqual(sourceCode.constructor.name, "CSSSourceCode");
			assert.strictEqual(sourceCode.ast, ast);
			assert.strictEqual(sourceCode.text, text);
			assert.strictEqual(sourceCode.comments, comments);
		});
	});

	describe("getText()", () => {
		it("should return the text of the source code", () => {
			const file = { body: "a {}", path: "test.json" };
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

	describe("getBlockLocWithBraces()", () => {

		let sourceCode;

		beforeEach(() => {
			const ast = {
				type: "StyleSheet",
				children: [],
				loc: {
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
				},
			};
			const text = "";
			sourceCode = new CSSSourceCode({
				text,
				ast,
			});
		});			

		it("should throw an error when passed a non-block node", () => {
			assert.throws(() => {
				sourceCode.getBlockLocWithBraces({ type: "foo" });
			}, /Expected a block node\./u);
		});

		it("should return the location of a block node with braces", () => {
			const ast = {
				type: "Block",
				children: [],
				loc: {
					start: {
						line: 1,
						column: 3,
						offset: 2,
					},
					end: {
						line: 1,
						column: 4,
						offset: 3,
					},
				},
			};

			assert.deepStrictEqual(sourceCode.getBlockLocWithBraces(ast), {
				start: {
					line: 1,
					column: 2,
					offset: 1,
				},
				end: {
					line: 1,
					column: 5,
					offset: 4,
				},
			});
		});
	});

	describe("getBlockRangeWithBraces()", () => {

		let sourceCode;

		beforeEach(() => {
			const ast = {
				type: "StyleSheet",
				children: [],
				loc: {
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
				},
			};
			const text = "";
			sourceCode = new CSSSourceCode({
				text,
				ast,
			});
		});

		it("should throw an error when passed a non-block node", () => {
			assert.throws(() => {
				sourceCode.getBlockRangeWithBraces({ type: "foo" });
			}, /Expected a block node\./u);
		});

		it("should return the range of a block node with braces", () => {
			const ast = {
				type: "Block",
				children: [],
				loc: {
					start: {
						line: 1,
						column: 3,
						offset: 2,
					},
					end: {
						line: 1,
						column: 4,
						offset: 3,
					},
				},
			};

			assert.deepStrictEqual(sourceCode.getBlockRangeWithBraces(ast), [1, 4]);
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
				comments: parseResult.comments
			});

			assert.deepStrictEqual(sourceCode.comments, []);
		});

		it("should contain an array of comments when parsing JSONC", () => {
			const file = { body: "a {\n/*test*/\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
				comments: parseResult.comments
			});

			// should contain one comment
			assert.strictEqual(sourceCode.comments.length, 1);

			const comment = sourceCode.comments[0];
			assert.strictEqual(comment.type, "Comment");
			assert.deepStrictEqual(comment.loc, {
				source: "test.css",
				start: { line: 2, column: 1, offset: 4 },
				end: { line: 2, column: 9, offset: 12 },
			});
		});
	});

	describe("lines", () => {
		it("should return an array of lines", () => {
			const file = { body: "a {\n/*test*/\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = new CSSSourceCode({
				text: file.body,
				ast: parseResult.ast,
			});

			assert.deepStrictEqual(sourceCode.lines, ["a {", "/*test*/", "}"]);
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
									]
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					}
				]
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
									]
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					}
				]
			};
			const text = '{"foo":{}}';
			const sourceCode = new CSSSourceCode({
				text,
				ast,
			});
			const node = ast.children[0].prelude.children[0].children[0];

			// call traverse to initialize the parent map
			sourceCode.traverse();

			assert.strictEqual(sourceCode.getParent(node), ast.children[0].prelude.children[0]);
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
									]
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					}
				]
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
									]
								},
							],
						},
						block: {
							type: "Block",
							children: [],
						},
					}
				]
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
				ast.children[0].prelude.children[0]
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
				comments: parseResult.comments
			});
		});

		afterEach(() => {
			sourceCode = null;
		});

		describe("getInlineConfigNodes()", () => {
			it("should return inline config comments", () => {
				const allComments = sourceCode.comments;
				const configComments =
					sourceCode.getInlineConfigNodes();

				const configCommentsIndexes = [
					1, 2, 3, 5, 6, 7, 8, 10, 13
				];

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
				const { configs, problems } =
					sourceCode.applyInlineConfig();

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
						}
					],
				);

				assert.strictEqual(problems.length, 1);
				assert.strictEqual(problems[0].ruleId, null);
				assert.strictEqual(
					problems[0].message,
					"eslint-disable-line comment should not span multiple lines.",
				);
				assert.strictEqual(
					problems[0].loc,
					allComments[10].loc,
				);
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
				step.target.type
			]);

			assert.deepStrictEqual(stepsArray, [
				[1, 'StyleSheet'],
				[1, 'Rule'],
				[1, 'SelectorList'],
				[1, 'Selector'],
				[1, 'TypeSelector'],
				[2, 'TypeSelector'],
				[2, 'Selector'],
				[2, 'SelectorList'],
				[1, 'Block'],
				[1, 'Declaration'],
				[1, 'Value'],
				[1, 'Number'],
				[2, 'Number'],
				[2, 'Value'],
				[2, 'Declaration'],
				[1, 'Declaration'],
				[1, 'Value'],
				[1, 'Identifier'],
				[2, 'Identifier'],
				[1, 'Operator'],
				[2, 'Operator'],
				[1, 'Identifier'],
				[2, 'Identifier'],
				[2, 'Value'],
				[2, 'Declaration'],
				[2, 'Block'],
				[2, 'Rule'],
				[1, 'Rule'],
				[1, 'SelectorList'],
				[1, 'Selector'],
				[1, 'TypeSelector'],
				[2, 'TypeSelector'],
				[1, 'Combinator'],
				[2, 'Combinator'],
				[1, 'TypeSelector'],
				[2, 'TypeSelector'],
				[1, 'PseudoClassSelector'],
				[2, 'PseudoClassSelector'],
				[2, 'Selector'],
				[2, 'SelectorList'],
				[1, 'Block'],
				[1, 'Declaration'],
				[1, 'Value'],
				[1, 'Hash'],
				[2, 'Hash'],
				[2, 'Value'],
				[2, 'Declaration'],
				[1, 'Declaration'],
				[1, 'Value'],
				[1, 'Dimension'],
				[2, 'Dimension'],
				[1, 'Number'],
				[2, 'Number'],
				[2, 'Value'],
				[2, 'Declaration'],
				[2, 'Block'],
				[2, 'Rule'],
				[2, 'StyleSheet']
			]);
		});
	});
});
