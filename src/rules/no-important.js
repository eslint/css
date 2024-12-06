/**
 * @fileoverview Rule to prevent !important in CSS.
 * @author Yann Bertrand
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Disallow !important annotations",
			recommended: true,
		},

		messages: {
			unexpectedImportant: "Unexpected !important annotation found.",
		},
	},

	create(context) {
		return {
			"Declaration[important=true]"(node) {
				context.report({
					loc: {
						start: node.loc.start,
						end: {
							line: node.loc.start.line,
							column:
								node.loc.start.column + node.property.length,
						},
					},
					messageId: "unexpectedImportant",
				});
			},
		};
	},
};
