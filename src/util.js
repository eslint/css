/**
 * @fileoverview Utility functions for ESLint CSS plugin.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/*
 * Note: Using `import()` in the JSDoc comments below because including them as
 * typedef comments here caused Rollup to remove them. I couldn't figure out why
 * this was happening so just working around for now.
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Determines if an error is a reference error.
 * @param {Object} error The error object to check.
 * @returns {error is import("css-tree").SyntaxReferenceError} True if the error is a reference error, false if not.
 */
export function isSyntaxReferenceError(error) {
	return typeof error.reference === "string";
}

/**
 * Determines if an error is a syntax match error.
 * @param {Object} error The error object to check.
 * @returns {error is import("css-tree").SyntaxMatchError} True if the error is a syntax match error, false if not.
 */
export function isSyntaxMatchError(error) {
	return typeof error.syntax === "string";
}
