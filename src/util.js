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
 * Finds the line and column offsets for a given offset in a string.
 * @param {string} text The text to search.
 * @param {number} offset The offset to find.
 * @returns {{lineOffset:number,columnOffset:number}} The location of the offset.
 */
export function findOffsets(text, offset) {
	// TODO
	let lineOffset = 0;
	let columnOffset = 0;

	for (let i = 0; i < offset; i++) {
		if (text[i] === "\n") {
			lineOffset++;
			columnOffset = 0;
		} else {
			columnOffset++;
		}
	}

	return {
		lineOffset,
		columnOffset,
	};
}
