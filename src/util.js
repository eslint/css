/**
 * @fileoverview Utility functions for ESLint CSS plugin.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SyntaxMatchError, SyntaxReferenceError, UnsupportedMatchingTree } from "@eslint/css-tree"
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if an error is a syntax match error.
 * @param {Object} error The error object to check.
 * @returns {error is SyntaxMatchError} True if the error is a syntax match error, false if not.
 */
export function isSyntaxMatchError(error) {
	return typeof error.syntax === "string";
}

/**
 * Determines if an error is a syntax reference error.
 * @param {Object} error The error object to check.
 * @returns {error is SyntaxReferenceError} True if the error is a syntax reference error, false if not.
 */
export function isSyntaxReferenceError(error) {
	return typeof error.reference === "string";
}

/**
 * Determines if an error is the lexer error returned when a value containing
 * `var()` or `env()` cannot be matched against a syntax definition.
 * @param {Object} error The error object to check.
 * @returns {error is UnsupportedMatchingTree} True if the error is an unsupported matching tree error, false if not.
 */
export function isUnsupportedMatchingTreeError(error) {
	return error.name === "UnsupportedMatchingTree";
}
