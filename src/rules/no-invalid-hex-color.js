/**
 * @fileoverview Rule to disallow invalid hex color
 * @author Akul Srivastava
 */

const VALID_HEX_REGEX = /^(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/iu;

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow invalid hex color.",
			recommended: true,
		},

		messages: {
			invalidHexColor: "Invalid hex color found.",
		},
	},

	create(context) {
		return {
			Hash(node) {
				const hashValue = node.value;
				const isValidHex = VALID_HEX_REGEX.test(hashValue);
				if (!isValidHex) {
					context.report({
						loc: node.loc,
						messageId: "invalidHexColor",
					});
				}
			},
		};
	},
};
