/**
 * @fileoverview Rule to prevent invalid properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { isSyntaxMatchError, isSyntaxReferenceError } from "../util.js";

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
 * Parses a var() function text and extracts the custom property name and fallback.
 * @param {string} text The text containing a var() function.
 * @returns {{ name: string, fallbackText: string | null } | null} The parsed variable name and optional fallback, or null if not a var().
 */
function parseVarFunction(text) {
	const match = text.match(varFunctionPattern);
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
		if (!parsed.fallbackText.toLowerCase().includes("var(")) {
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

/** @type {NoInvalidPropertiesRuleDefinition} */
export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid properties",
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
					cache.set(currentVarName, valueText);
					return valueText;
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
				return rawFallbackText;
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
				return fallbackCandidate.trim();
			}

			return null;
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
			"Rule > Block > Declaration"() {
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

			"Rule > Block > Declaration > Value > *:not(Function)"(node) {
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

			"Rule > Block > Declaration:exit"(node) {
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
};
