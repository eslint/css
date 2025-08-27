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
// eslint-disable-next-line regexp/no-super-linear-backtracking --  TODO: fix \s*(.+) to match newline characters
const varFunctionPattern = /var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)/iu;

/**
 * Parses a var() function text and extracts the custom property name and fallback.
 * @param {string} text
 * @returns {{ name: string, fallbackText: string | null } | null}
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
 * @return {Array<string>} The list of variable names of fallback value.
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
		 * We need to track this as a stack because we can have nested
		 * rules that use the `var()` function, and we need to
		 * ensure that we validate the innermost rule first.
		 * @type {Array<Map<string,FunctionNodePlain>>}
		 */
		const replacements = [];

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
		 * @param {string} rawFallbackText
		 * @param {Map<string, string>} cache Cache for memoization within a single resolution scope
		 * @param {Set<string>} [seen] Set of already seen variables to detect cycles
		 * @returns {string | null}
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

		return {
			"Rule > Block > Declaration"() {
				replacements.push(new Map());
			},

			"Function[name=/^var$/i]"(node) {
				const map = replacements.at(-1);
				if (!map) {
					return;
				}

				/*
				 * Store the custom property name and the function node
				 * so can use these to validate the value later.
				 */
				const name = node.children[0].name;
				map.set(name, node);
			},

			"Rule > Block > Declaration:exit"(node) {
				if (node.property.startsWith("--")) {
					// store the custom property name and value to validate later
					vars.set(node.property, node.value);

					// don't validate custom properties
					return;
				}

				const varsFound = replacements.pop();

				/** @type {Map<string,CssLocationRange>} */
				const valuesWithVarLocs = new Map();
				const usingVars = varsFound?.size > 0;
				let value = node.value;

				if (usingVars) {
					const valueList = [];
					/**
					 * Cache for resolved variable values within this single declaration.
					 * Prevents re-resolving the same variable and re-walking long `var()` chains.
					 * @type {Map<string,string>}
					 */
					const resolvedCache = new Map();
					const valueNodes = node.value.children;

					// When `var()` is used, we store all the values to `valueList` with the replacement of `var()` with there values or fallback values
					for (const child of valueNodes) {
						// If value is a function starts with `var()`
						if (
							child.type === "Function" &&
							child.name.toLowerCase() === "var"
						) {
							const varValue = vars.get(child.children[0].name);

							// If the variable is found, use its value, otherwise check for fallback values
							if (varValue) {
								const resolvedValue = resolveVariable(
									child.children[0].name,
									resolvedCache,
								);
								if (resolvedValue !== null) {
									valueList.push(resolvedValue);
									valuesWithVarLocs.set(
										resolvedValue,
										child.loc,
									);
								} else {
									if (!allowUnknownVariables) {
										context.report({
											loc: child.children[0].loc,
											messageId: "unknownVar",
											data: {
												var: child.children[0].name,
											},
										});
										return;
									}
								}
							} else {
								// If the variable is not found and doesn't have a fallback value, report it
								if (child.children.length === 1) {
									if (!allowUnknownVariables) {
										context.report({
											loc: child.children[0].loc,
											messageId: "unknownVar",
											data: {
												var: child.children[0].name,
											},
										});

										return;
									}
								} else {
									// If it has a fallback value, use that
									if (child.children[2].type === "Raw") {
										const raw =
											child.children[2].value.trim();
										const resolvedFallbackValue =
											resolveFallback(raw, resolvedCache);
										if (resolvedFallbackValue !== null) {
											valueList.push(
												resolvedFallbackValue,
											);
											valuesWithVarLocs.set(
												resolvedFallbackValue,
												child.loc,
											);
										} else if (!allowUnknownVariables) {
											context.report({
												loc: child.children[0].loc,
												messageId: "unknownVar",
												data: {
													var: child.children[0].name,
												},
											});
											return;
										}
									}
								}
							}
						} else {
							// If the child is not a `var()` function, just add its text to the `valueList`
							const valueText = sourceCode.getText(child).trim();
							valueList.push(valueText);
							valuesWithVarLocs.set(valueText, child.loc);
						}
					}

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
							usingVars &&
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
							loc: usingVars
								? (valuesWithVarLocs.get(errorValue) ??
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
								value: usingVars
									? value.slice(
											error.mismatchOffset,
											error.mismatchOffset +
												error.mismatchLength,
										)
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
