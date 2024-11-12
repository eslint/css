/**
 * @fileoverview Rule to prevent the use of unknown properties in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import data from "css-tree/definition-syntax-data";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const knownProperties = new Set(Object.keys(data.properties));

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow unknown properties.",
			recommended: true,
		},

		messages: {
			unknownProperty: "Unknown property '{{property}}' found.",
		},
	},

	create(context) {
		return {
			Declaration(node) {
				if (
					!node.property.startsWith("--") &&
					!knownProperties.has(node.property)
				) {
					const loc = node.loc;

					context.report({
						loc: {
							start: loc.start,
							end: {
								line: loc.start.line,
								column: loc.start.column + node.property.length,
							},
						},
						messageId: "unknownProperty",
						data: {
							property: node.property,
						},
					});
				}
			},
		};
	},
};
