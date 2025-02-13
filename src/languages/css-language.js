/**
 * @filedescription The CSSLanguage class.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import {
	parse as originalParse,
	lexer as originalLexer,
	fork,
	toPlainObject,
} from "css-tree";
import { CSSSourceCode } from "./css-source-code.js";
import { visitorKeys } from "./css-visitor-keys.js";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").CssNode} CssNode */
/** @typedef {import("css-tree").CssNodePlain} CssNodePlain */
/** @typedef {import("css-tree").StyleSheet} StyleSheet */
/** @typedef {import("css-tree").Comment} Comment */
/** @typedef {import("css-tree").Lexer} Lexer */
/** @typedef {import("css-tree").SyntaxConfig} SyntaxConfig */
/** @typedef {import("@eslint/core").Language} Language */
/** @typedef {import("@eslint/core").OkParseResult<CssNodePlain> & { comments: Comment[], lexer: Lexer }} OkParseResult */
/** @typedef {import("@eslint/core").ParseResult<CssNodePlain>} ParseResult */
/** @typedef {import("@eslint/core").File} File */
/** @typedef {import("@eslint/core").FileError} FileError */

/**
 * @typedef {Object} CSSLanguageOptions
 * @property {boolean} [tolerant] Whether to be tolerant of recoverable parsing errors.
 * @property {SyntaxConfig} [customSyntax] Custom syntax to use for parsing.
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * CSS Language Object
 * @implements {Language}
 */
export class CSSLanguage {
	/**
	 * The type of file to read.
	 * @type {"text"}
	 */
	fileType = "text";

	/**
	 * The line number at which the parser starts counting.
	 * @type {0|1}
	 */
	lineStart = 1;

	/**
	 * The column number at which the parser starts counting.
	 * @type {0|1}
	 */
	columnStart = 1;

	/**
	 * The name of the key that holds the type of the node.
	 * @type {string}
	 */
	nodeTypeKey = "type";

	/**
	 * The visitor keys for the CSSTree AST.
	 * @type {Record<string, string[]>}
	 */
	visitorKeys = visitorKeys;

	/**
	 * The default language options.
	 * @type {CSSLanguageOptions}
	 */
	defaultLanguageOptions = {
		tolerant: false,
	};

	/**
	 * Validates the language options.
	 * @param {CSSLanguageOptions} languageOptions The language options to validate.
	 * @throws {Error} When the language options are invalid.
	 */
	validateLanguageOptions(languageOptions) {
		if (
			"tolerant" in languageOptions &&
			typeof languageOptions.tolerant !== "boolean"
		) {
			throw new TypeError(
				"Expected a boolean value for 'tolerant' option.",
			);
		}

		if ("customSyntax" in languageOptions) {
			if (
				typeof languageOptions.customSyntax !== "object" ||
				languageOptions.customSyntax === null
			) {
				throw new TypeError(
					"Expected an object value for 'customSyntax' option.",
				);
			}
		}
	}

	/**
	 * Parses the given file into an AST.
	 * @param {File} file The virtual file to parse.
	 * @param {Object} [context] The parsing context.
	 * @param {CSSLanguageOptions} [context.languageOptions] The language options to use for parsing.
	 * @returns {ParseResult} The result of parsing.
	 */
	parse(file, { languageOptions = {} } = {}) {
		// Note: BOM already removed
		const text = /** @type {string} */ (file.body);

		/** @type {Comment[]} */
		const comments = [];

		/** @type {FileError[]} */
		const errors = [];

		const { tolerant } = languageOptions;
		const { parse, lexer } = languageOptions.customSyntax
			? fork(languageOptions.customSyntax)
			: { parse: originalParse, lexer: originalLexer };

		/*
		 * Check for parsing errors first. If there's a parsing error, nothing
		 * else can happen. However, a parsing error does not throw an error
		 * from this method - it's just considered a fatal error message, a
		 * problem that ESLint identified just like any other.
		 */
		try {
			const root = toPlainObject(
				parse(text, {
					filename: file.path,
					positions: true,
					onComment(value, loc) {
						comments.push({
							type: "Comment",
							value,
							loc,
						});
					},
					onParseError(error) {
						if (!tolerant) {
							// @ts-ignore -- types are incorrect
							errors.push(error);
						}
					},
				}),
			);

			if (errors.length) {
				return {
					ok: false,
					errors,
				};
			}

			return {
				ok: true,
				ast: root,
				comments,
				lexer,
			};
		} catch (ex) {
			return {
				ok: false,
				errors: [ex],
			};
		}
	}

	/**
	 * Creates a new `CSSSourceCode` object from the given information.
	 * @param {File} file The virtual file to create a `CSSSourceCode` object from.
	 * @param {OkParseResult} parseResult The result returned from `parse()`.
	 * @returns {CSSSourceCode} The new `CSSSourceCode` object.
	 */
	createSourceCode(file, parseResult) {
		return new CSSSourceCode({
			text: /** @type {string} */ (file.body),
			ast: parseResult.ast,
			comments: parseResult.comments,
			lexer: parseResult.lexer,
		});
	}
}
