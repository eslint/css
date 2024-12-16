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
} from "../data/baseline-data.js";

//-----------------------------------------------------------------------------
// Type Definitions
//-----------------------------------------------------------------------------

/** @typedef {import("css-tree").AtrulePlain} AtrulePlain */

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
	 * @returns {void}
	 */
	addProperty(property) {
		this.#properties.set(property, new SupportedProperty(property));
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
		},
	},

	create(context) {
		const availability = context.options[0].available;
		const baselineLevel =
			availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;
		const supportsRules = new SupportsRules();

		return {
			"Atrule[name=supports]"() {
				supportsRules.push(new SupportsRule());
			},

			"Atrule[name=supports] SupportsDeclaration > Declaration"(node) {
				const supportsRule = supportsRules.last();

				if (!supportsRule.hasProperty(node.property)) {
					supportsRule.addProperty(node.property);
				}

				// for now we can only check identifiers
				node.value.children.forEach(child => {
					if (child.type === "Identifier") {
						supportsRule
							.getProperty(node.property)
							.addIdentifier(child.name);
					}
				});
			},

			"Rule > Block > Declaration"(node) {
				// ignore unknown properties - no-invalid-properties already catches this
				if (!properties.has(node.property)) {
					return;
				}

				// if the property has been tested in a @supports rule, ignore it
				if (supportsRules.hasProperty(node.property)) {
					let valueIsValid = false;

					if (supportsRules.hasPropertyIdentifiers(node.property)) {
						for (const child of node.value.children) {
							if (child.type === "Identifier") {
								if (
									supportsRules.hasPropertyIdentifier(
										node.property,
										child.name,
									)
								) {
									valueIsValid = true;
									continue;
								}

								const propertyValueLevel = propertyValues
									.get(node.property)
									.get(child.name);

								if (propertyValueLevel < baselineLevel) {
									context.report({
										loc: child.loc,
										messageId: "notBaselinePropertyValue",
										data: {
											property: node.property,
											value: child.name,
											availability,
										},
									});
								}
							}
						}
					}

					/*
					 * When we make it here, that means we've checked all the
					 * property values we can check. If we can confirm that the
					 * value is valid, then we can exit early. Otherwise, we
					 * must continue on to check the baseline status of the
					 * property itself.
					 */
					if (valueIsValid) {
						return;
					}
				}

				/*
				 * If we made it here, that means the property isn't referenced
				 * in an `@supports` rule, so we need to check it directly.
				 */

				const ruleLevel = properties.get(node.property);

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
							property: node.property,
							availability,
						},
					});
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
