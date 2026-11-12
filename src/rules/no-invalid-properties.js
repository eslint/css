/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	isSyntaxMatchError,
	isSyntaxReferenceError,
	isUnsupportedMatchingTreeError,
} from "../util.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/**
 * @import { CSSRuleDefinition } from "../types.js"
 * @import { ValuePlain, FunctionNodePlain, CssLocationRange } from "@eslint/css-tree";
 * @typedef {"invalidPropertyValue" | "unknownProperty" | "unknownVar"} NoInvalidPropertiesMessageIds
 * @typedef {[{allowUnknownVariables?: boolean}]} NoInvalidPropertiesOptions
 * @typedef {CSSRuleDefinition<{ RuleOptions: NoInvalidPropertiesOptions, MessageIds: NoInvalidPropertiesMessageIds }>} NoInvalidPropertiesRuleDefinition
 */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Regex to match var() functional notation with optional fallback.
 */
const varFunctionPattern = /var\(\s*(--[^,\s)]+)\s*(?:,([\s\S]+))?\)/iu;

/**
 * Regex to check for the start of a var() function at a given index.
 */
const varFunctionStartPattern = /(?<![\w-])var\(/iuy;

/**
 * Maximum length of a value after its nested var() functions are substituted.
 * Values that would grow beyond this are treated as unresolvable.
 */
const MAX_SUBSTITUTED_VALUE_LENGTH = 100_000;

/**
 * Regex to check whether a character can be part of an identifier, number,
 * or dimension token, so two such characters next to each other would merge.
 */
const nameCharPattern = /[\w\-.%#\\\u0080-\uffff]/u;

/**
 * Finds the index of the quote that closes the string starting at the given index.
 * @param {string} text The text to search.
 * @param {number} openIndex The index of the opening quote.
 * @returns {number} The index of the closing quote, or the text length if the string is unterminated.
 */
function findStringEnd(text, openIndex) {
	const quote = text[openIndex];

	for (let i = openIndex + 1; i < text.length; i++) {
		if (text[i] === "\\") {
			i++;
		} else if (text[i] === quote) {
			return i;
		}
	}

	return text.length;
}

/**
 * Finds the index of the last character of the comment starting at the given index.
 * @param {string} text The text to search.
 * @param {number} openIndex The index of the "/" that starts the comment.
 * @returns {number} The index of the comment's closing "/", or the text length if the comment is unterminated.
 */
function findCommentEnd(text, openIndex) {
	const end = text.indexOf("*/", openIndex + 2);
	return end === -1 ? text.length : end + 1;
}

/**
 * Joins two pieces of a value, adding a space between them when their
 * adjacent characters would otherwise merge into a single token.
 * @param {string} left The text before the join.
 * @param {string} right The text after the join.
 * @returns {string} The joined text.
 */
function joinTokens(left, right) {
	if (
		left &&
		right &&
		nameCharPattern.test(left.at(-1)) &&
		nameCharPattern.test(right[0])
	) {
		return `${left} ${right}`;
	}
	return left + right;
}

/**
 * Finds the index of the closing parenthesis matching the opening one,
 * ignoring parentheses inside strings, comments, and escaped characters.
 * @param {string} text The text to search.
 * @param {number} openIndex The index of the opening parenthesis.
 * @returns {number} The index of the matching closing parenthesis, or -1 if not found.
 */
function findClosingParen(text, openIndex) {
	let depth = 0;

	for (let i = openIndex; i < text.length; i++) {
		const char = text[i];

		if (char === "\\") {
			i++;
		} else if (char === '"' || char === "'") {
			i = findStringEnd(text, i);
		} else if (char === "/" && text[i + 1] === "*") {
			i = findCommentEnd(text, i);
		} else if (char === "(") {
			depth++;
		} else if (char === ")") {
			depth--;
			if (depth === 0) {
				return i;
			}
		}
	}

	return -1;
}

/**
 * Finds the start of the next var() function in a value, ignoring text inside strings and comments.
 * @param {string} text The text to search.
 * @param {number} fromIndex The index to start searching from.
 * @returns {number} The index where the var() function starts, or -1 if not found.
 */
function findVarFunctionStart(text, fromIndex) {
	for (let i = fromIndex; i < text.length; i++) {
		const char = text[i];

		if (char === "\\") {
			i++;
		} else if (char === '"' || char === "'") {
			i = findStringEnd(text, i);
		} else if (char === "/" && text[i + 1] === "*") {
			i = findCommentEnd(text, i);
		} else {
			varFunctionStartPattern.lastIndex = i;
			if (varFunctionStartPattern.test(text)) {
				return i;
			}
		}
	}

	return -1;
}

/**
 * Parses a var() function text and extracts the custom property name and fallback.
 * @param {string} text The text containing a var() function.
 * @returns {{ name: string, fallbackText: string | null } | null} The parsed variable name and optional fallback, or null if the text is not a single var().
 */
function parseVarFunction(text) {
	const trimmed = text.trim();
	if (
		!/^var\(/iu.test(trimmed) ||
		findClosingParen(trimmed, 3) !== trimmed.length - 1
	) {
		return null;
	}

	const match = trimmed.match(varFunctionPattern);
	if (!match) {
		return null;
	}
	return {
		name: match[1].trim(),
		fallbackText: match[2]?.trim(),
	};
}

/**
 * Extracts the list of fallback value or variable name used in a `var()` that is used as fallback function.
 * For example, for `var(--my-color, var(--fallback-color, red));` it will return `["--fallback-color", "red"]`.
 * @param {string} value The fallback value that is used in `var()`.
 * @returns {Array<string>} The list of variable names of fallback value.
 */
function getVarFallbackList(value) {
	const list = [];
	let currentValue = value;

	while (true) {
		const parsed = parseVarFunction(currentValue);

		if (!parsed) {
			break;
		}

		list.push(parsed.name);

		if (!parsed.fallbackText) {
			break;
		}

		// If fallback is not another var(), we're done
		if (!parseVarFunction(parsed.fallbackText)) {
			list.push(parsed.fallbackText);
			break;
		}

		// Continue parsing from fallback
		currentValue = parsed.fallbackText;
	}

	return list;
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default /** @satisfies {NoInvalidPropertiesRuleDefinition} */ ({
	meta: {
		type: "problem",
		languages: ["css/css"],

		docs: {
			description: "Disallow invalid properties",
			dialects: ["CSS"],
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/no-invalid-properties.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowUnknownVariables: {
						type: "boolean",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowUnknownVariables: false,
			},
		],

		messages: {
			invalidPropertyValue:
				"Invalid value '{{value}}' for property '{{property}}'. Expected {{expected}}.",
			unknownProperty: "Unknown property '{{property}}' found.",
			unknownVar: "Can't validate with unknown variable '{{var}}'.",
		},
	},

	create(context) {
		const sourceCode = context.sourceCode;
		const lexer = sourceCode.lexer;

		/** @type {Map<string,ValuePlain>} */
		const vars = new Map();

		/**
		 * @type {Array<{
		 *   valueParts: string[],
		 *   functionPartsStack: string[][],
		 *   valueSegmentLocs: Map<string,CssLocationRange>,
		 *   skipValidation: boolean,
		 *   hadVarSubstitution: boolean,
		 *   resolvedCache:  Map<string,string>
		 * }>}
		 */
		const declStack = [];

		const [{ allowUnknownVariables }] = context.options;

		/**
		 * Iteratively resolves CSS variable references until a value is found.
		 * @param {string} variableName The variable name to resolve
		 * @param {Map<string, string>} cache Cache for memoization within a single resolution scope
		 * @param {Set<string>} [seen] Set of already seen variables to detect cycles
		 * @returns {string|null} The resolved value or null if not found
		 */
		function resolveVariable(variableName, cache, seen = new Set()) {
			/** @type {Array<string>} */
			const fallbackStack = [];
			let currentVarName = variableName;

			/*
			 * Resolves a CSS variable by following its reference chain.
			 *
			 * Phase 1: Follow var() references
			 * - Use `seen` to detect cycles
			 * - Use `cache` for memoization
			 * - If value is concrete: cache and return
			 * - If value is another var(--next, <fallback>):
			 *     push fallback to stack and continue with --next
			 * - If variable unknown: proceed to Phase 2
			 *
			 * Phase 2: Try fallback values (if Phase 1 failed)
			 * - Process fallbacks in reverse order (LIFO)
			 * - Resolve each via resolveFallback()
			 * - Return first successful resolution
			 */
			while (true) {
				if (seen.has(currentVarName)) {
					break;
				}
				seen.add(currentVarName);

				if (cache.has(currentVarName)) {
					return cache.get(currentVarName);
				}

				const valueNode = vars.get(currentVarName);
				if (!valueNode) {
					break;
				}

				const valueText = sourceCode.getText(valueNode).trim();
				const parsed = parseVarFunction(valueText);

				if (!parsed) {
					// eslint-disable-next-line no-use-before-define -- substituteVarFunctions and resolveVariable are mutually recursive
					const resolvedValue = substituteVarFunctions(
						valueText,
						cache,
						seen,
					);
					if (resolvedValue === null) {
						break;
					}
					cache.set(currentVarName, resolvedValue);
					return resolvedValue;
				}

				if (parsed.fallbackText) {
					fallbackStack.push(parsed.fallbackText);
				}
				currentVarName = parsed.name;
			}

			while (fallbackStack.length > 0) {
				const fallbackText = fallbackStack.pop();
				// eslint-disable-next-line no-use-before-define -- resolveFallback and resolveVariable are mutually recursive
				const resolvedFallback = resolveFallback(
					fallbackText,
					cache,
					seen,
				);
				if (resolvedFallback !== null) {
					return resolvedFallback;
				}
			}

			return null;
		}

		/**
		 * Resolves a fallback text which can contain nested var() calls.
		 * Returns the first resolvable value or null if none resolve.
		 * @param {string} rawFallbackText The raw fallback text to resolve.
		 * @param {Map<string, string>} cache Cache for memoization within a single resolution scope.
		 * @param {Set<string>} [seen] Set of already seen variables to detect cycles.
		 * @returns {string | null} The resolved fallback value, or null if none can be resolved.
		 */
		function resolveFallback(rawFallbackText, cache, seen = new Set()) {
			const fallbackVarList = getVarFallbackList(rawFallbackText);
			if (fallbackVarList.length === 0) {
				// eslint-disable-next-line no-use-before-define -- substituteVarFunctions and resolveFallback are mutually recursive
				return substituteVarFunctions(rawFallbackText, cache, seen);
			}

			for (const fallbackCandidate of fallbackVarList) {
				if (fallbackCandidate.startsWith("--")) {
					const resolved = resolveVariable(
						fallbackCandidate,
						cache,
						seen,
					);
					if (resolved !== null) {
						return resolved;
					}
					continue;
				}
				// eslint-disable-next-line no-use-before-define -- substituteVarFunctions and resolveFallback are mutually recursive
				return substituteVarFunctions(
					fallbackCandidate.trim(),
					cache,
					seen,
				);
			}

			return null;
		}

		/**
		 * Replaces every var() function nested in a value with its resolved value,
		 * keeping the surrounding text. For example, `rgba(var(--rgb), 0.5)`
		 * becomes `rgba(255, 255, 255, 0.5)` when `--rgb` is `255, 255, 255`.
		 * @param {string} text The value text that may contain var() functions.
		 * @param {Map<string, string>} cache Cache for memoization within a single resolution scope.
		 * @param {Set<string>} seen Set of already seen variables to detect cycles.
		 * @returns {string | null} The value with all var() functions replaced, or null if any can't be resolved.
		 */
		function substituteVarFunctions(text, cache, seen) {
			let result = "";
			let lastIndex = 0;

			for (
				let start = findVarFunctionStart(text, 0);
				start !== -1;
				start = findVarFunctionStart(text, lastIndex)
			) {
				const closeIndex = findClosingParen(text, start + 3);
				const parsed =
					closeIndex !== -1 &&
					parseVarFunction(text.slice(start, closeIndex + 1));

				if (!parsed) {
					return null;
				}

				let resolved = resolveVariable(
					parsed.name,
					cache,
					new Set(seen),
				);
				if (resolved === null && parsed.fallbackText) {
					resolved = resolveFallback(
						parsed.fallbackText,
						cache,
						new Set(seen),
					);
				}
				if (resolved === null) {
					return null;
				}

				result = joinTokens(
					joinTokens(result, text.slice(lastIndex, start)),
					resolved,
				);
				if (result.length > MAX_SUBSTITUTED_VALUE_LENGTH) {
					return null;
				}
				lastIndex = closeIndex + 1;
			}

			result = joinTokens(result, text.slice(lastIndex));
			return result.length > MAX_SUBSTITUTED_VALUE_LENGTH ? null : result;
		}

		/**
		 * Process a var function node and add its resolved value to the value list
		 * @param {Object} varNode The var() function node
		 * @param {string[]} valueList Array to collect processed values
		 * @param {Map<string,CssLocationRange>} valueSegmentLocs Map of rebuilt value segments to their locations
		 * @param {Map<string, string>} resolvedCache Cache for resolved variable values to prevent redundant lookups
		 * @returns {boolean} Whether processing was successful
		 */
		function processVarFunction(
			varNode,
			valueList,
			valueSegmentLocs,
			resolvedCache,
		) {
			const varValue = vars.get(varNode.children[0].name);

			if (varValue) {
				const resolvedValue = resolveVariable(
					varNode.children[0].name,
					resolvedCache,
				);
				if (resolvedValue) {
					valueList.push(resolvedValue);
					valueSegmentLocs.set(resolvedValue, varNode.loc);
					return true;
				}
			}

			// If the variable is not found and doesn't have a fallback value, report it
			if (varNode.children.length === 1) {
				if (!allowUnknownVariables) {
					context.report({
						loc: varNode.children[0].loc,
						messageId: "unknownVar",
						data: { var: varNode.children[0].name },
					});
					return false;
				}
				return true;
			}

			// Handle fallback values
			if (varNode.children[2].type !== "Raw") {
				return true;
			}

			const fallbackValue = varNode.children[2].value.trim();
			const resolvedFallbackValue = resolveFallback(
				fallbackValue,
				resolvedCache,
			);
			if (resolvedFallbackValue) {
				valueList.push(resolvedFallbackValue);
				valueSegmentLocs.set(resolvedFallbackValue, varNode.loc);
				return true;
			}

			// No valid fallback found
			if (!allowUnknownVariables) {
				context.report({
					loc: varNode.children[0].loc,
					messageId: "unknownVar",
					data: { var: varNode.children[0].name },
				});
				return false;
			}

			return true;
		}

		return {
			"Rule > Block Declaration"() {
				declStack.push({
					valueParts: [],
					functionPartsStack: [],
					valueSegmentLocs: new Map(),
					skipValidation: false,
					hadVarSubstitution: false,
					/**
					 * Cache for resolved variable values within this single declaration.
					 * Prevents re-resolving the same variable and re-walking long `var()` chains.
					 */
					resolvedCache: new Map(),
				});
			},

			"Rule > Block Declaration > Value > *:not(Function)"(node) {
				const state = declStack.at(-1);
				const text = sourceCode.getText(node).trim();
				state.valueParts.push(text);
				state.valueSegmentLocs.set(text, node.loc);
			},

			Function() {
				const state = declStack.at(-1);
				if (!state) {
					return;
				}
				state.functionPartsStack.push([]);
			},

			"Function > *:not(Function)"(node) {
				const state = declStack.at(-1);
				if (!state) {
					return;
				}
				const parts = state.functionPartsStack.at(-1);
				const text = sourceCode.getText(node).trim();
				parts.push(text);
				state.valueSegmentLocs.set(text, node.loc);
			},

			"Function:exit"(node) {
				const state = declStack.at(-1);
				if (!state || state.skipValidation) {
					return;
				}

				const parts = state.functionPartsStack.pop();
				let result;
				if (node.name.toLowerCase() === "var") {
					const resolvedParts = [];
					const success = processVarFunction(
						node,
						resolvedParts,
						state.valueSegmentLocs,
						state.resolvedCache,
					);

					if (!success) {
						state.skipValidation = true;
						return;
					}

					if (resolvedParts.length === 0) {
						return;
					}

					state.hadVarSubstitution = true;
					result = resolvedParts[0];
				} else {
					result = `${node.name}(${parts.join(" ")})`;
				}

				const parentParts = state.functionPartsStack.at(-1);
				if (parentParts) {
					parentParts.push(result);
				} else {
					state.valueParts.push(result);
				}
			},

			"Rule > Block Declaration:exit"(node) {
				const state = declStack.pop();
				if (node.property.startsWith("--")) {
					// store the custom property name and value to validate later
					vars.set(node.property, node.value);

					// don't validate custom properties
					return;
				}

				if (state.skipValidation) {
					return;
				}

				let value = node.value;
				if (state.hadVarSubstitution) {
					const valueList = state.valueParts;
					value =
						valueList.length > 0
							? valueList.join(" ")
							: sourceCode.getText(node.value);
				}

				const { error } = lexer.matchProperty(node.property, value);

				if (error) {
					// validation failure
					if (isSyntaxMatchError(error)) {
						const errorValue =
							state.hadVarSubstitution &&
							value.slice(
								error.mismatchOffset,
								error.mismatchOffset + error.mismatchLength,
							);

						context.report({
							/*
							 * When using variables, check to see if the error
							 * occurred at a location where a variable was replaced.
							 * If so, use that location; otherwise, use the error's
							 * reported location.
							 */
							loc: state.hadVarSubstitution
								? (state.valueSegmentLocs.get(errorValue) ??
									node.value.loc)
								: error.loc,
							messageId: "invalidPropertyValue",
							data: {
								property: node.property,

								/*
								 * When using variables, slice the value to
								 * only include the part that caused the error.
								 * Otherwise, use the full value from the error.
								 */
								value: state.hadVarSubstitution
									? errorValue
									: error.css,
								expected: error.syntax,
							},
						});
						return;
					}
					if (isUnsupportedMatchingTreeError(error)) {
						/*
						 * The value contains env(), whose value comes from the user
						 * agent, or a var() that could not be resolved above and was
						 * let through because unknown variables are allowed. The
						 * lexer can't match either, so there is nothing left to check.
						 */
						return;
					}
					if (
						!allowUnknownVariables ||
						isSyntaxReferenceError(error)
					) {
						// unknown property
						context.report({
							loc: {
								start: node.loc.start,
								end: {
									line: node.loc.start.line,
									column:
										node.loc.start.column +
										node.property.length,
								},
							},
							messageId: "unknownProperty",
							data: {
								property: node.property,
							},
						});
					}
				}
			},
		};
	},
});
