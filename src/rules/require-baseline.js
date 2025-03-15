/**
 * @fileoverview Rule to enforce the use of baseline features.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import {
	BASELINE_HIGH,
	BASELINE_LOW,
	properties,
	propertyValues,
	atRules,
	mediaConditions,
	types,
	selectors,
} from "../data/baseline-data.js";
import { namedColors } from "../data/colors.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("@eslint/css-tree").AtrulePlain} AtrulePlain */
/** @typedef {import("@eslint/css-tree").Identifier} Identifier */
/** @typedef {import("@eslint/css-tree").FunctionNodePlain} FunctionNodePlain */

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Represents a property that is supported via @supports.
 */
class SupportedProperty {
	/**
	 * The name of the property.
	 * @type {string}
	 */
	name;

	/**
	 * Supported identifier values.
	 * @type {Set<string>}
	 */
	#identifiers = new Set();

	/**
	 * Supported function types.
	 * @type {Set<string>}
	 */
	#functions = new Set();

	/**
	 * Creates a new instance.
	 * @param {string} name The name of the property.
	 */
	constructor(name) {
		this.name = name;
	}

	/**
	 * Adds an identifier to the list of supported identifiers.
	 * @param {string} identifier The identifier to add.
	 * @returns {void}
	 */
	addIdentifier(identifier) {
		this.#identifiers.add(identifier);
	}

	/**
	 * Determines if an identifier is supported.
	 * @param {string} identifier The identifier to check.
	 * @returns {boolean} `true` if the identifier is supported, `false` if not.
	 */
	hasIdentifier(identifier) {
		return this.#identifiers.has(identifier);
	}

	/**
	 * Determines if any identifiers are supported.
	 * @returns {boolean} `true` if any identifiers are supported, `false` if not.
	 */
	hasIdentifiers() {
		return this.#identifiers.size > 0;
	}

	/**
	 * Adds a function to the list of supported functions.
	 * @param {string} func The function to add.
	 * @returns {void}
	 */
	addFunction(func) {
		this.#functions.add(func);
	}

	/**
	 * Determines if a function is supported.
	 * @param {string} func The function to check.
	 * @returns {boolean} `true` if the function is supported, `false` if not.
	 */
	hasFunction(func) {
		return this.#functions.has(func);
	}

	/**
	 * Determines if any functions are supported.
	 * @returns {boolean} `true` if any functions are supported, `false` if not.
	 */
	hasFunctions() {
		return this.#functions.size > 0;
	}
}

/**
 * Represents an `@supports` rule and everything it enables.
 */
class SupportsRule {
	/**
	 * The properties supported by this rule.
	 * @type {Map<string, SupportedProperty>}
	 */
	#properties = new Map();

	/**
	 * The selectors supported by this rule.
	 * @type {Set<string>}
	 */
	#selectors = new Set();

	/**
	 * Adds a property to the rule.
	 * @param {string} property The name of the property.
	 * @returns {SupportedProperty} The supported property object.
	 */
	addProperty(property) {
		if (this.#properties.has(property)) {
			return this.#properties.get(property);
		}

		const supportedProperty = new SupportedProperty(property);
		this.#properties.set(property, supportedProperty);

		return supportedProperty;
	}

	/**
	 * Determines if the rule supports a property.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if the property is supported, `false` if not.
	 */
	hasProperty(property) {
		return this.#properties.has(property);
	}

	/**
	 * Gets the supported property.
	 * @param {string} property The name of the property.
	 * @returns {SupportedProperty} The supported property.
	 */
	getProperty(property) {
		return this.#properties.get(property);
	}

	/**
	 * Determines if the rule supports a property value.
	 * @param {string} property The name of the property.
	 * @param {string} identifier The identifier to check.
	 * @returns {boolean} `true` if the property value is supported, `false` if not.
	 */
	hasPropertyIdentifier(property, identifier) {
		const supportedProperty = this.#properties.get(property);

		if (!supportedProperty) {
			return false;
		}

		return supportedProperty.hasIdentifier(identifier);
	}

	/**
	 * Determines if the rule supports any property values.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if any property values are supported, `false` if not.
	 */
	hasPropertyIdentifiers(property) {
		const supportedProperty = this.#properties.get(property);

		if (!supportedProperty) {
			return false;
		}

		return supportedProperty.hasIdentifiers();
	}

	/**
	 * Determines if the rule supports a function.
	 * @param {string} property The name of the property.
	 * @param {string} func The function to check.
	 * @returns {boolean} `true` if the function is supported, `false` if not.
	 */
	hasFunction(property, func) {
		const supportedProperty = this.#properties.get(property);

		if (!supportedProperty) {
			return false;
		}

		return supportedProperty.hasFunction(func);
	}

	/**
	 * Determines if the rule supports any functions.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if any functions are supported, `false` if not.
	 */
	hasFunctions(property) {
		const supportedProperty = this.#properties.get(property);

		if (!supportedProperty) {
			return false;
		}

		return supportedProperty.hasFunctions();
	}

	/**
	 * Adds a selector to the rule.
	 * @param {string} selector The name of the selector.
	 * @returns {void}
	 */
	addSelector(selector) {
		this.#selectors.add(selector);
	}

	/**
	 * Determines if the rule supports a selector.
	 * @param {string} selector The name of the selector.
	 * @returns {boolean} `true` if the selector is supported, `false` if not.
	 */
	hasSelector(selector) {
		return this.#selectors.has(selector);
	}
}

/**
 * Represents a collection of supports rules.
 */
class SupportsRules {
	/**
	 * A collection of supports rules.
	 * @type {Array<SupportsRule>}
	 */
	#rules = [];

	/**
	 * Adds a rule to the collection.
	 * @param {SupportsRule} rule The rule to add.
	 * @returns {void}
	 */
	push(rule) {
		this.#rules.push(rule);
	}

	/**
	 * Removes the last rule from the collection.
	 * @returns {SupportsRule} The last rule in the collection.
	 */
	pop() {
		return this.#rules.pop();
	}

	/**
	 * Retrieves the last rule in the collection.
	 * @returns {SupportsRule} The last rule in the collection.
	 */
	last() {
		return this.#rules.at(-1);
	}

	/**
	 * Determines if any rule supports a property.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if any rule supports the property, `false` if not.
	 */
	hasProperty(property) {
		return this.#rules.some(rule => rule.hasProperty(property));
	}

	/**
	 * Determines if any rule supports a property identifier.
	 * @param {string} property The name of the property.
	 * @param {string} identifier The identifier to check.
	 * @returns {boolean} `true` if any rule supports the property value, `false` if not.
	 */
	hasPropertyIdentifier(property, identifier) {
		return this.#rules.some(rule =>
			rule.hasPropertyIdentifier(property, identifier),
		);
	}

	/**
	 * Determines if any rule supports any property identifiers.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if any rule supports the property values, `false` if not.
	 */
	hasPropertyIdentifiers(property) {
		return this.#rules.some(rule => rule.hasPropertyIdentifiers(property));
	}

	/**
	 * Determines if any rule supports a function.
	 * @param {string} property The name of the property.
	 * @param {string} func The function to check.
	 * @returns {boolean} `true` if any rule supports the function, `false` if not.
	 */
	hasPropertyFunction(property, func) {
		return this.#rules.some(rule => rule.hasFunction(property, func));
	}

	/**
	 * Determines if any rule supports any functions.
	 * @param {string} property The name of the property.
	 * @returns {boolean} `true` if any rule supports the functions, `false` if not.
	 */
	hasPropertyFunctions(property) {
		return this.#rules.some(rule => rule.hasFunctions(property));
	}

	/**
	 * Determines if any rule supports a selector.
	 * @param {string} selector The name of the selector.
	 * @returns {boolean} `true` if any rule supports the selector, `false` if not.
	 */
	hasSelector(selector) {
		return this.#rules.some(rule => rule.hasSelector(selector));
	}
}

/**
 * Represents the required availability of a feature.
 */
class BaselineAvailability {
	/**
	 * The preferred Baseline year.
	 * @type {number}
	 */
	#baselineYear = undefined;

	/**
	 * The preferred Baseline status.
	 * @type {number}
	 */
	#baselineStatus = undefined;

	/**
	 * @param {string | number} availability The required level of feature availability.
	 */
	constructor(availability) {
		this.availability = availability;

		if (typeof availability === "number") {
			this.#baselineYear = availability;
		} else {
			this.#baselineStatus =
				availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;
		}
	}

	/**
	 * Determines whether a feature meets the required availability.
	 * @param {Object} encodedStatus A feature's encoded baseline status and year.
	 * @returns {boolean} `true` if the feature is supported, `false` if not.
	 */
	isSupported(encodedStatus) {
		if (!encodedStatus) {
			// if we don't know the status, assume it's supported
			return true;
		}

		const parts = encodedStatus.split(":");
		const status = Number(parts[0]);
		const year = Number(parts[1] || NaN);

		if (this.#baselineYear) {
			return year <= this.#baselineYear;
		}

		return status >= this.#baselineStatus;
	}
}

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Enforce the use of baseline features",
			recommended: true,
		},

		schema: [
			{
				type: "object",
				properties: {
					available: {
						anyOf: [
							{
								enum: ["widely", "newly"],
							},
							{
								// baseline year
								type: "integer",
								minimum: 2000,
								maximum: new Date().getFullYear(),
							},
						],
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				available: "widely",
			},
		],

		messages: {
			notBaselineProperty:
				"Property '{{property}}' is not a {{availability}} available baseline feature.",
			notBaselinePropertyValue:
				"Value '{{value}}' of property '{{property}}' is not a {{availability}} available baseline feature.",
			notBaselineAtRule:
				"At-rule '@{{atRule}}' is not a {{availability}} available baseline feature.",
			notBaselineType:
				"Type '{{type}}' is not a {{availability}} available baseline feature.",
			notBaselineMediaCondition:
				"Media condition '{{condition}}' is not a {{availability}} available baseline feature.",
			notBaselineSelector:
				"Selector '{{selector}}' is not a {{availability}} available baseline feature.",
		},
	},

	create(context) {
		const baselineAvailability = new BaselineAvailability(
			context.options[0].available,
		);
		const supportsRules = new SupportsRules();

		/**
		 * Checks a property value identifier to see if it's a baseline feature.
		 * @param {string} property The name of the property.
		 * @param {Identifier} child The node to check.
		 * @returns {void}
		 */
		function checkPropertyValueIdentifier(property, child) {
			// named colors are always valid
			if (namedColors.has(child.name)) {
				return;
			}
			const possiblePropertyValues = propertyValues.get(property);

			// if we don't know of any possible property values, just skip it
			if (!possiblePropertyValues) {
				return;
			}

			const featureStatus = possiblePropertyValues.get(child.name);

			// if we don't know of any possible property values, just skip it
			if (featureStatus === undefined) {
				return;
			}

			if (!baselineAvailability.isSupported(featureStatus)) {
				context.report({
					loc: child.loc,
					messageId: "notBaselinePropertyValue",
					data: {
						property,
						value: child.name,
						availability: baselineAvailability.availability,
					},
				});
			}
		}

		/**
		 * Checks a property value function to see if it's a baseline feature.
		 * @param {import("@eslint/css-tree").FunctionNodePlain} child The node to check.
		 * @returns {void}
		 **/
		function checkPropertyValueFunction(child) {
			const featureStatus = types.get(child.name);

			// if we don't know of any possible property values, just skip it
			if (featureStatus === undefined) {
				return;
			}

			if (!baselineAvailability.isSupported(featureStatus)) {
				context.report({
					loc: child.loc,
					messageId: "notBaselineType",
					data: {
						type: child.name,
						availability: baselineAvailability.availability,
					},
				});
			}
		}

		return {
			"Atrule[name=supports]"() {
				supportsRules.push(new SupportsRule());
			},

			"Atrule[name=supports] > AtrulePrelude > Condition"(node) {
				const supportsRule = supportsRules.last();

				for (let i = 0; i < node.children.length; i++) {
					const conditionChild = node.children[i];

					// if a SupportsDeclaration is preceded by "not" then we don't consider it
					if (
						conditionChild.type === "Identifier" &&
						conditionChild.name === "not"
					) {
						i++;
						continue;
					}

					// save the supported properties and values for this at-rule
					if (conditionChild.type === "SupportsDeclaration") {
						const { declaration } = conditionChild;
						const property = declaration.property;
						const supportedProperty =
							supportsRule.addProperty(property);

						declaration.value.children.forEach(child => {
							if (child.type === "Identifier") {
								supportedProperty.addIdentifier(child.name);
								return;
							}

							if (child.type === "Function") {
								supportedProperty.addFunction(child.name);
							}
						});

						continue;
					}

					if (
						conditionChild.type === "FeatureFunction" &&
						conditionChild.feature === "selector"
					) {
						for (const selectorChild of conditionChild.value
							.children) {
							supportsRule.addSelector(selectorChild.name);
						}
					}
				}
			},

			"Rule > Block > Declaration"(node) {
				const property = node.property;

				// ignore unknown properties - no-invalid-properties already catches this
				if (!properties.has(property)) {
					return;
				}

				/*
				 * Step 1: Check that the property is in the baseline.
				 *
				 * If the property has been tested in a @supports rule, we don't need to
				 * check it because it won't be applied if the browser doesn't support it.
				 */
				if (!supportsRules.hasProperty(property)) {
					const featureStatus = properties.get(property);

					if (!baselineAvailability.isSupported(featureStatus)) {
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
							messageId: "notBaselineProperty",
							data: {
								property,
								availability: baselineAvailability.availability,
							},
						});

						/*
						 * If the property isn't in baseline, then we don't go
						 * on to check the values. If the property itself isn't
						 * in baseline then chances are the values aren't too,
						 * and there's no need to report multiple errors for the
						 * same property.
						 */
						return;
					}
				}

				/*
				 * With tolerant parsing, it's possible that the value is `Raw`
				 * and therefore doesn't have children. If that's the case then
				 * we just exit.
				 */
				if (!node.value?.children) {
					return;
				}

				/*
				 * Step 2: Check that the property values are in the baseline.
				 */
				for (const child of node.value.children) {
					if (child.type === "Identifier") {
						// if the property value has been tested in a @supports rule, don't check it
						if (
							!supportsRules.hasPropertyIdentifier(
								property,
								child.name,
							)
						) {
							checkPropertyValueIdentifier(property, child);
						}

						continue;
					}

					if (child.type === "Function") {
						if (
							!supportsRules.hasPropertyFunction(
								property,
								child.name,
							)
						) {
							checkPropertyValueFunction(child);
						}
					}
				}
			},

			"Atrule[name=supports]:exit"() {
				supportsRules.pop();
			},

			"Atrule[name=media] > AtrulePrelude > MediaQueryList > MediaQuery > Condition"(
				node,
			) {
				for (const child of node.children) {
					// ignore unknown media conditions - no-invalid-at-rules already catches this
					if (!mediaConditions.has(child.name)) {
						continue;
					}

					if (child.type !== "Feature") {
						continue;
					}

					const featureStatus = mediaConditions.get(child.name);

					if (!baselineAvailability.isSupported(featureStatus)) {
						const loc = child.loc;

						context.report({
							loc: {
								start: {
									line: loc.start.line,
									// add 1 to account for the @ symbol
									column: loc.start.column + 1,
								},
								end: {
									line: loc.start.line,
									column:
										// add 1 to account for the @ symbol
										loc.start.column +
										child.name.length +
										1,
								},
							},
							messageId: "notBaselineMediaCondition",
							data: {
								condition: child.name,
								availability: baselineAvailability.availability,
							},
						});
					}
				}
			},

			Atrule(node) {
				// ignore unknown at-rules - no-invalid-at-rules already catches this
				if (!atRules.has(node.name)) {
					return;
				}

				const featureStatus = atRules.get(node.name);

				if (!baselineAvailability.isSupported(featureStatus)) {
					const loc = node.loc;

					context.report({
						loc: {
							start: loc.start,
							end: {
								line: loc.start.line,

								// add 1 to account for the @ symbol
								column: loc.start.column + node.name.length + 1,
							},
						},
						messageId: "notBaselineAtRule",
						data: {
							atRule: node.name,
							availability: baselineAvailability.availability,
						},
					});
				}
			},

			Selector(node) {
				for (const child of node.children) {
					const selector = child.name;

					if (!selectors.has(selector)) {
						continue;
					}

					// if the selector has been tested in a @supports rule, don't check it
					if (supportsRules.hasSelector(selector)) {
						continue;
					}

					const featureStatus = selectors.get(selector);

					if (!baselineAvailability.isSupported(featureStatus)) {
						const loc = child.loc;

						// some selectors are prefixed with the : or :: symbols
						let prefixSymbolLength = 0;
						if (child.type === "PseudoClassSelector") {
							prefixSymbolLength = 1;
						} else if (child.type === "PseudoElementSelector") {
							prefixSymbolLength = 2;
						}

						context.report({
							loc: {
								start: loc.start,
								end: {
									line: loc.start.line,
									column:
										loc.start.column +
										selector.length +
										prefixSymbolLength,
								},
							},
							messageId: "notBaselineSelector",
							data: {
								selector,
								availability: baselineAvailability.availability,
							},
						});
					}
				}
			},

			NestingSelector(node) {
				// NestingSelector implies CSS nesting
				const selector = "nesting";
				const featureStatus = selectors.get(selector);
				if (baselineAvailability.isSupported(featureStatus)) {
					return;
				}

				context.report({
					loc: node.loc,
					messageId: "notBaselineSelector",
					data: {
						selector,
						availability: baselineAvailability.availability,
					},
				});
			},
		};
	},
};
