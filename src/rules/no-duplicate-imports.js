/**
 * @fileoverview Rule to prevent duplicate imports in CSS.
 * @author Nicholas C. Zakas
 */

export default {
	meta: {
		type: "problem",

		docs: {
			description: "Disallow duplicate @import rules.",
			recommended: true,
		},

		messages: {
			duplicateImport: "Unexpected duplicate @import rule for {url}.",
		},
	},

	create(context) {
		const imports = new Set();

		return {
			"Atrule[name=import]"(node) {
				const url = node.prelude.children[0].value;

				if (imports.has(url)) {
					context.report({
						loc: node.loc,
						messageId: "duplicateImport",
						data: { url },
					});
				} else {
					imports.add(url);
				}
			},
		};
	},
};
