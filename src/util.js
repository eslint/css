/**
 * @fileoverview Utility functions for ESLint CSS plugin.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { SyntaxMatchError, SyntaxReferenceError } from "@eslint/css-tree"
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if an error is a syntax match error.
 * @param {SyntaxMatchError | SyntaxReferenceError | Error} error The error object to check.
 * @returns {error is SyntaxMatchError} True if the error is a syntax match error, false if not.
 */
export function isSyntaxMatchError(error) {
	return "syntax" in error && typeof error.syntax === "string";
}

/**
 * Determines if an error is a syntax reference error.
 * @param {SyntaxMatchError | SyntaxReferenceError | Error} error The error object to check.
 * @returns {error is SyntaxReferenceError} True if the error is a syntax reference error, false if not.
 */
export function isSyntaxReferenceError(error) {
	return "reference" in error && typeof error.reference === "string";
}
