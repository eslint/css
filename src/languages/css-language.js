/**
 * @fileoverview The CSSLanguage class.
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
	tokenTypes,
} from "@eslint/css-tree";
import { CSSSourceCode } from "./css-source-code.js";
import { visitorKeys } from "./css-visitor-keys.js";

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/**
 * @import { CssNodePlain, Comment, Lexer, StyleSheetPlain, SyntaxConfig } from "@eslint/css-tree"
 * @import { Language, OkParseResult, ParseResult, File, FileError } from "@eslint/core";
 */

/** @typedef {OkParseResult<StyleSheetPlain> & { comments: Comment[], lexer: Lexer }} CSSOkParseResult */
/** @typedef {ParseResult<StyleSheetPlain>} CSSParseResult */
/**
 * @typedef {Object} CSSLanguageOptions
 * @property {boolean} [tolerant] Whether to be tolerant of recoverable parsing errors.
 * @property {SyntaxConfig} [customSyntax] Custom syntax to use for parsing.
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const blockOpenerTokenTypes = new Map([
	[tokenTypes.Function, ")"],
	[tokenTypes.LeftCurlyBracket, "}"],
	[tokenTypes.LeftParenthesis, ")"],
	[tokenTypes.LeftSquareBracket, "]"],
]);

const blockCloserTokenTypes = new Map([
	[tokenTypes.RightCurlyBracket, "{"],
	[tokenTypes.RightParenthesis, "("],
	[tokenTypes.RightSquareBracket, "["],
]);

/**
 * Recursively replaces all function values in an object with boolean true.
 * Used to make objects serializable for JSON output.
 *
 * @param {Record<string,any>} object The object to process.
 * @returns {Record<string,any>|unknown[]|unknown} A copy of the object with all functions replaced by true.
 */
function replaceFunctions(object) {
	if (typeof object !== "object" || object === null) {
		return object;
	}
	if (Array.isArray(object)) {
		return object.map(replaceFunctions);
	}
	const result = {};
	for (const key of Object.keys(object)) {
		const value = object[key];
		if (typeof value === "function") {
			result[key] = true;
		} else if (typeof value === "object" && value !== null) {
			result[key] = replaceFunctions(value);
		} else {
			result[key] = value;
		}
	}
	return result;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * CSS Language Object
 * @implements {Language<{ LangOptions: CSSLanguageOptions; Code: CSSSourceCode; RootNode: StyleSheetPlain; Node: CssNodePlain}>}
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
	 * @returns {void}
	 * @throws {TypeError} When the language options are invalid.
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
	 * Normalizes the language options so they can be serialized.
	 * @param {CSSLanguageOptions} languageOptions The language options to normalize.
	 * @returns {CSSLanguageOptions} The normalized language options.
	 */
	normalizeLanguageOptions(languageOptions) {
		// if there's no custom syntax then no changes are necessary
		if (!languageOptions?.customSyntax) {
			return languageOptions;
		}
		// Shallow copy
		const clone = { ...languageOptions };

		Object.defineProperty(clone, "toJSON", {
			value() {
				// another shallow copy
				const result = { ...this };

				// if there's no custom syntax, no changes are necessary
				if (!this.customSyntax) {
					return result;
				}

				result.customSyntax = { ...result.customSyntax };

				if (result.customSyntax.node) {
					result.customSyntax.node = replaceFunctions(
						result.customSyntax.node,
					);
				}

				if (result.customSyntax.scope) {
					result.customSyntax.scope = replaceFunctions(
						result.customSyntax.scope,
					);
				}

				if (result.customSyntax.atrule) {
					result.customSyntax.atrule = replaceFunctions(
						result.customSyntax.atrule,
					);
				}

				return result;
			},
			enumerable: false,
			configurable: true,
		});

		return clone;
	}

	/**
	 * Parses the given file into an AST.
	 * @param {File} file The virtual file to parse.
	 * @param {Object} [context] The parsing context.
	 * @param {CSSLanguageOptions} [context.languageOptions] The language options to use for parsing.
	 * @returns {CSSParseResult} The result of parsing.
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
							errors.push(error);
						}
					},
					onToken(type, start, end, index) {
						if (tolerant) {
							return;
						}

						switch (type) {
							// these already generate errors
							case tokenTypes.BadString:
							case tokenTypes.BadUrl:
								break;

							default:
								/* eslint-disable new-cap -- This is a valid call */
								if (this.isBlockOpenerTokenType(type)) {
									if (
										this.getBlockTokenPairIndex(index) ===
										-1
									) {
										const loc = this.getRangeLocation(
											start,
											end,
										);
										errors.push(
											parse.SyntaxError(
												`Missing closing ${blockOpenerTokenTypes.get(type)}`,
												text,
												start,
												loc.start.line,
												loc.start.column,
											),
										);
									}
								} else if (this.isBlockCloserTokenType(type)) {
									if (
										this.getBlockTokenPairIndex(index) ===
										-1
									) {
										const loc = this.getRangeLocation(
											start,
											end,
										);
										errors.push(
											parse.SyntaxError(
												`Missing opening ${blockCloserTokenTypes.get(type)}`,
												text,
												start,
												loc.start.line,
												loc.start.column,
											),
										);
									}
								}
							/* eslint-enable new-cap -- This is a valid call */
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
				ast: /** @type {StyleSheetPlain} */ (root),
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
	 * @param {CSSOkParseResult} parseResult The result returned from `parse()`.
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
