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
	types,
} from "../data/baseline-data.js";
import { namedColors } from "../data/colors.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").AtrulePlain} AtrulePlain */
/** @typedef {import("css-tree").Identifier} Identifier */
/** @typedef {import("css-tree").FunctionNodePlain} FunctionNodePlain */

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
						enum: ["widely", "newly"],
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
		},
	},

	create(context) {
		const availability = context.options[0].available;
		const baselineLevel =
			availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;
		const supportsRules = new SupportsRules();

		/**
		 * Checks a property value identifier to see if it's a baseline feature.
		 * @param {string} property The name of the property.
		 * @param {import("css-tree").Identifier} child The node to check.
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

			const propertyValueLevel = possiblePropertyValues.get(child.name);

			if (propertyValueLevel < baselineLevel) {
				context.report({
					loc: child.loc,
					messageId: "notBaselinePropertyValue",
					data: {
						property,
						value: child.name,
						availability,
					},
				});
			}
		}

		/**
		 * Checks a property value function to see if it's a baseline feature.
		 * @param {import("css-tree").FunctionNodePlain} child The node to check.
		 * @returns {void}
		 **/
		function checkPropertyValueFunction(child) {
			const propertyValueLevel = types.get(child.name);

			if (propertyValueLevel < baselineLevel) {
				context.report({
					loc: child.loc,
					messageId: "notBaselineType",
					data: {
						type: child.name,
						availability,
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
					const ruleLevel = properties.get(property);

					if (ruleLevel < baselineLevel) {
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
								availability,
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

			Atrule(node) {
				// ignore unknown at-rules - no-invalid-at-rules already catches this
				if (!atRules.has(node.name)) {
					return;
				}

				const ruleLevel = atRules.get(node.name);

				if (ruleLevel < baselineLevel) {
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
							availability,
						},
					});
				}
			},
		};
	},
};
