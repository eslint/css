/**
 * @fileoverview Integration tests with ESLint.
 * @author Milos Djermanovic
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import css from "../../src/index.js";
import ESLintAPI from "eslint";
const { ESLint } = ESLintAPI;

import assert from "node:assert";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("Plugin", () => {

	describe("Configuration Comments", () => {
		const config = {
			files: ["*.css"],
			plugins: {
				css,
			},
			language: "css/css",
			rules: {
				"css/no-empty-blocks": "error",
			},
		};

		let eslint;

		beforeEach(() => {
			eslint = new ESLint({
				overrideConfigFile: true,
				overrideConfig: config,
			});
		});

		it("should report empty block without any configuration comments present", async () => {
			const code = "a { }";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 1);
			assert.strictEqual(
				results[0].messages[0].message,
				"Unexpected empty block found.",
			);
		});

		it("should report empty block when a disable configuration comment is present and followed by an enable configuration comment", async () => {
			const code =
				"/* eslint-disable css/no-empty-blocks */\na {}\n/* eslint-enable css/no-empty-blocks */\nb {}";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 1);
			assert.strictEqual(
				results[0].messages[0].message,
				"Unexpected empty block found.",
			);
			assert.strictEqual(results[0].messages[0].line, 4);
			assert.strictEqual(results[0].messages[0].column, 3);
			
			assert.strictEqual(results[0].suppressedMessages.length, 1);
			assert.strictEqual(results[0].suppressedMessages[0].message, "Unexpected empty block found.");
			assert.strictEqual(results[0].suppressedMessages[0].line, 2);
			assert.strictEqual(results[0].suppressedMessages[0].column, 3);
		});

		it("should not report empty block when a disable configuration comment is present", async () => {
			const code =
				"/* eslint-disable css/no-empty-blocks */\na {}";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 0);
			assert.strictEqual(results[0].suppressedMessages.length, 1);
			assert.strictEqual(results[0].suppressedMessages[0].message, "Unexpected empty block found.");
			assert.strictEqual(results[0].suppressedMessages[0].line, 2);
			assert.strictEqual(results[0].suppressedMessages[0].column, 3);
		});

		it("should not report empty block when a disable-line configuration comment is present", async () => {
			const code =
				"a {} /* eslint-disable-line css/no-empty-blocks */";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 0);

			assert.strictEqual(results[0].suppressedMessages.length, 1);
			assert.strictEqual(results[0].suppressedMessages[0].message, "Unexpected empty block found.");
			assert.strictEqual(results[0].suppressedMessages[0].line, 1);
			assert.strictEqual(results[0].suppressedMessages[0].column, 3);

		});

		it("should not report empty block when a disable-next-line configuration comment is present", async () => {
			const code =
				"/* eslint-disable-next-line css/no-empty-blocks */\na {}";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 0);

			assert.strictEqual(results[0].suppressedMessages.length, 1);
			assert.strictEqual(results[0].suppressedMessages[0].message, "Unexpected empty block found.");
			assert.strictEqual(results[0].suppressedMessages[0].line, 2);
			assert.strictEqual(results[0].suppressedMessages[0].column, 3);

		});

		it("should not report empty block when a configuration comment disables a rule is present", async () => {
			const code =
				"/* eslint css/no-empty-blocks: off */\na {}";
			const results = await eslint.lintText(code, {
				filePath: "test.css",
			});

			assert.strictEqual(results.length, 1);
			assert.strictEqual(results[0].messages.length, 0);
			assert.strictEqual(results[0].suppressedMessages.length, 0);
		});
	});
});
