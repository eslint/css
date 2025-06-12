export default {
	meta: {
		type: "suggestion",

		docs: {
			description:
				"Enforce use of fallback fonts and a generic font last",
			recommended: true,
			url: "https://github.com/eslint/css/blob/main/docs/rules/font-family-fallbacks.md",
		},

		messages: {
			useFallbackFonts: "Use fallback fonts and a generic font last.",
		},
	},

	create(context) {
		const variableMap = new Map();

		return {
			Rule(node) {
				if (
					node.prelude.children[0].type === "Selector" &&
					node.prelude.children[0].children[0].type ===
						"PseudoClassSelector" &&
					node.prelude.children[0].children[0].name === "root"
				) {
					const variableName = node.block.children[0].property;
					const variableValue = node.block.children[0].value.value;

					variableMap.set(variableName, variableValue);
				}
			},

			Declaration(node) {
				if (node.property === "font-family") {
					if (
						node.value.children.length > 0 &&
						node.value.children[0].type === "Function" &&
						node.value.children[0].name === "var"
					) {
						const getVariableName = variableMap.get(
							node.value.children[0].children[0].name,
						);

						if (
							getVariableName &&
							!getVariableName.includes("sans-serif")
						) {
							context.report({
								node,
								messageId: "useFallbackFonts",
							});
						}
					}
				}
			},
		};
	},
};
