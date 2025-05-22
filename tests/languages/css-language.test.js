/**
 * @fileoverview Tests for CSSLanguage
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { CSSLanguage } from "../../src/languages/css-language.js";
import assert from "node:assert";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("CSSLanguage", () => {
	describe("visitorKeys", () => {
		it("should have visitorKeys property", () => {
			const language = new CSSLanguage();

			assert.deepStrictEqual(language.visitorKeys.StyleSheet, [
				"children",
			]);
		});
	});

	describe("parse()", () => {
		it("should parse CSS", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a {\n\n}",
				path: "test.css",
			});

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "StyleSheet");
			assert.strictEqual(result.ast.children[0].type, "Rule");
		});

		it("should return an error when CSS has a recoverable error", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a { foo; bar: 1! }",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 2);

			assert.strictEqual(result.errors[0].message, "Colon is expected");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 8);

			assert.strictEqual(
				result.errors[1].message,
				"Identifier is expected",
			);
			assert.strictEqual(result.errors[1].line, 1);
			assert.strictEqual(result.errors[1].column, 18);
		});

		it("should not return an error when CSS has a recoverable error and tolerant: true is used", () => {
			const language = new CSSLanguage();
			const result = language.parse(
				{
					body: "a { foo; bar: 1! }",
					path: "test.css",
				},
				{ languageOptions: { tolerant: true } },
			);

			assert.strictEqual(result.ok, true);
		});

		it("should use custom syntax when provided with an object", () => {
			const language = new CSSLanguage();
			const customSyntax = {
				properties: {
					"-custom-prop": "<length>",
				},
			};

			const result = language.parse(
				{
					body: "a { -custom-prop: 5px; }",
					path: "test.css",
				},
				{ languageOptions: { customSyntax } },
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "StyleSheet");
			assert.strictEqual(result.ast.children[0].type, "Rule");
		});

		it("should use custom syntax when provided with a function", () => {
			const language = new CSSLanguage();
			const result = language.parse(
				{
					body: "a { -custom-prop: 5px; }",
					path: "test.css",
				},
				{
					languageOptions: {
						customSyntax(syntax) {
							syntax.properties = {
								"-custom-prop": "<length>",
							};
							return syntax;
						},
					},
				},
			);

			assert.strictEqual(result.ok, true);
			assert.strictEqual(result.ast.type, "StyleSheet");
			assert.strictEqual(result.ast.children[0].type, "Rule");
		});

		it("should return an error when EOF is discovered before block close", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a {",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 1);
			assert.strictEqual(result.errors[0].message, "Missing closing }");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 3);
			assert.strictEqual(result.errors[0].offset, 2);
		});

		it("should return an error when a CSS bad string is found", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a { content: 'this\nstring is not properly closed' }",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 2);
			assert.strictEqual(result.errors[0].message, "Missing closing }");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 3);
			assert.strictEqual(result.errors[0].offset, 2);
			assert.strictEqual(result.errors[1].message, "Unexpected input");
			assert.strictEqual(result.errors[1].line, 1);
			assert.strictEqual(result.errors[1].column, 14);
			assert.strictEqual(result.errors[1].offset, 13);
		});

		it("should return an error when a CSS bad URL is found", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a { background: url(foo bar.png) }",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 1);
			assert.strictEqual(result.errors[0].message, "Unexpected input");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 17);
			assert.strictEqual(result.errors[0].offset, 16);
		});

		it("should return an error when braces are unclosed", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a { color: red;",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 1);
			assert.strictEqual(result.errors[0].message, "Missing closing }");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 3);
			assert.strictEqual(result.errors[0].offset, 2);
		});

		it("should return an error when square brackets are unclosed", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a[foo { color: red; }",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 3); // other errors caused by the first one
			assert.strictEqual(result.errors[0].message, "Missing closing ]");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 2);
			assert.strictEqual(result.errors[0].offset, 1);
		});

		it("should return an error when parentheses are unclosed", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "@supports (color: red {}",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 2); // other errors caused by the first one
			assert.strictEqual(result.errors[0].message, "Missing closing )");
			assert.strictEqual(result.errors[0].line, 1);
			assert.strictEqual(result.errors[0].column, 11);
			assert.strictEqual(result.errors[0].offset, 10);
		});

		it("should return an error when function parentheses is unclosed", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a { width: min(40%, 400px; }",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 4); // other errors caused by the first one
			assert.strictEqual(result.errors[1].message, "Missing closing )");
			assert.strictEqual(result.errors[1].line, 1);
			assert.strictEqual(result.errors[1].column, 12);
			assert.strictEqual(result.errors[1].offset, 11);
		});

		it("should not return an error when braces are unclosed and tolerant: true is used", () => {
			const language = new CSSLanguage();
			const result = language.parse(
				{
					body: "a { color: red;",
					path: "test.css",
				},
				{ languageOptions: { tolerant: true } },
			);

			assert.strictEqual(result.ok, true);
		});
	});

	describe("validateLanguageOptions()", () => {
		it("should not throw for valid language options", () => {
			const language = new CSSLanguage();

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({});
			});

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ tolerant: true });
			});

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({ tolerant: false });
			});

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({
					customSyntax: {
						properties: {
							"-custom-prop": "<length>",
						},
					},
				});
			});

			assert.doesNotThrow(() => {
				language.validateLanguageOptions({
					customSyntax: () => ({}),
				});
			});
		});

		it("should throw for invalid tolerant option", () => {
			const language = new CSSLanguage();

			assert.throws(() => {
				language.validateLanguageOptions({ tolerant: "true" });
			}, new TypeError("Expected a boolean value for 'tolerant' option."));

			assert.throws(() => {
				language.validateLanguageOptions({ tolerant: 1 });
			}, new TypeError("Expected a boolean value for 'tolerant' option."));

			assert.throws(() => {
				language.validateLanguageOptions({ tolerant: {} });
			}, new TypeError("Expected a boolean value for 'tolerant' option."));
		});

		it("should throw for null customSyntax option", () => {
			const language = new CSSLanguage();

			assert.throws(() => {
				language.validateLanguageOptions({ customSyntax: null });
			}, new TypeError("Expected an object or function value for 'customSyntax' option."));
		});

		it("should throw for invalid customSyntax option types", () => {
			const language = new CSSLanguage();

			assert.throws(() => {
				language.validateLanguageOptions({ customSyntax: "string" });
			}, new TypeError("Expected an object or function value for 'customSyntax' option."));

			assert.throws(() => {
				language.validateLanguageOptions({ customSyntax: 123 });
			}, new TypeError("Expected an object or function value for 'customSyntax' option."));

			assert.throws(() => {
				language.validateLanguageOptions({ customSyntax: true });
			}, new TypeError("Expected an object or function value for 'customSyntax' option."));
		});
	});

	describe("createSourceCode()", () => {
		it("should create a CSSSourceCode instance", () => {
			const file = { body: "a {\n\n}", path: "test.css" };
			const language = new CSSLanguage();
			const parseResult = language.parse(file);
			const sourceCode = language.createSourceCode(file, parseResult);
			assert.strictEqual(sourceCode.constructor.name, "CSSSourceCode");

			assert.strictEqual(sourceCode.ast.type, "StyleSheet");
			assert.strictEqual(sourceCode.ast.children[0].type, "Rule");
			assert.strictEqual(sourceCode.text, file.body);
			assert.strictEqual(sourceCode.comments.length, 0);
		});

		it("should create a CSSSourceCode instance for CSS code with comments", () => {
			const language = new CSSLanguage();
			const file = { body: "a {\n/*test*/\n}", path: "test.css" };
			const parseResult = language.parse(file);
			const sourceCode = language.createSourceCode(file, parseResult);

			assert.strictEqual(sourceCode.constructor.name, "CSSSourceCode");

			assert.strictEqual(sourceCode.ast.type, "StyleSheet");
			assert.strictEqual(sourceCode.ast.children[0].type, "Rule");
			assert.strictEqual(sourceCode.text, file.body);
			assert.strictEqual(sourceCode.comments.length, 1);
		});
	});
});
