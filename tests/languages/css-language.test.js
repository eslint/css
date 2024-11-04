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

		it("should return an error when parsing invalid CSS", () => {
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

		// https://github.com/csstree/csstree/issues/301
		it.skip("should return an error when EOF is discovered before block close", () => {
			const language = new CSSLanguage();
			const result = language.parse({
				body: "a {",
				path: "test.css",
			});

			assert.strictEqual(result.ok, false);
			assert.strictEqual(result.ast, undefined);
			assert.strictEqual(result.errors.length, 1);
			assert.strictEqual(result.errors[0].message, "Colon is expected");
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
			const sourceCode = language.createSourceCode(
				file,
				parseResult,
				"test.jsonc",
			);

			assert.strictEqual(sourceCode.constructor.name, "CSSSourceCode");

			assert.strictEqual(sourceCode.ast.type, "StyleSheet");
			assert.strictEqual(sourceCode.ast.children[0].type, "Rule");
			assert.strictEqual(sourceCode.text, file.body);
			assert.strictEqual(sourceCode.comments.length, 1);
		});
	});
});
