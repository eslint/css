/**
 * @fileoverview Rule to prevent empty blocks in CSS.
 * @author Nicholas C. Zakas
 */

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Disallow empty blocks",
			recommended: true,
		},

		messages: {
			emptyBlock: "Unexpected empty block found.",
		},
	},

	create(context) {
		return {
			Block(node) {
				if (node.children.length === 0) {
					context.report({
						loc: node.loc,
						messageId: "emptyBlock",
					});
				}
			},
		};
	},
};
