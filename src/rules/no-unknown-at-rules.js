/**
 * @fileoverview Rule to prevent the use of unknown at-rules in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import data from "css-tree/definition-syntax-data";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const knownAtRules = new Set(Object.keys(data.atrules));

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow unknown at-rules",
			recommended: true,
		},

		messages: {
			unknownAtRule: "Unknown at-rule '{{name}}' found.",
		},
	},

	create(context) {
		return {
			Atrule(node) {
				if (!knownAtRules.has(node.name)) {
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
						messageId: "unknownAtRule",
						data: {
							name: node.name,
						},
					});
				}
			},
		};
	},
};
