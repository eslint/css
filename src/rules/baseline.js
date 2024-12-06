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
	atRules,
} from "../data/baseline-data.js";

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
			notBaselineAtRule:
				"At-rule '@{{atRule}}' is not a {{availability}} available baseline feature.",
		},
	},

	create(context) {
		const availability = context.options[0].available;
		const baselineLevel =
			availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;
		const atSupportedProperties = new Set();

		return {
			"Atrule[name=supports] SupportsDeclaration > Declaration"(node) {
				atSupportedProperties.add(node.property);
			},

			"Rule > Block > Declaration"(node) {
				// ignore unknown properties - no-invalid-properties already catches this
				if (!properties.has(node.property)) {
					return;
				}

				// if the property has been tested in a @supports rule, ignore it
				if (atSupportedProperties.has(node.property)) {
					return;
				}

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

			"Atrule[name=supports]:exit"(node) {
				// remove all properties tested in this @supports rule
				node.prelude.children.forEach(condition => {
					condition.children.forEach(child => {
						if (child.type === "SupportsDeclaration") {
							atSupportedProperties.delete(
								child.declaration.property,
							);
						}
					});
				});
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
