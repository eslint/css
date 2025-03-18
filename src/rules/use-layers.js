/**
 * @fileoverview Rule to require layers in CSS.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------

export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		docs: {
			description: "Require use of layers",
			url: "https://github.com/eslint/css/blob/main/docs/rules/use-layers.md",
		},

		schema: [
			{
				type: "object",
				properties: {
					allowUnnamedLayers: {
						type: "boolean",
					},
					requireImportLayers: {
						type: "boolean",
					},
					layerNamePattern: {
						type: "string",
					},
				},
				additionalProperties: false,
			},
		],

		defaultOptions: [
			{
				allowUnnamedLayers: false,
				requireImportLayers: true,
				layerNamePattern: "",
			},
		],

		messages: {
			missingLayer: "Expected rule to be within a layer.",
			missingLayerName: "Expected layer to have a name.",
			missingImportLayer: "Expected import to be within a layer.",
			layerNameMismatch:
				"Expected layer name '{{ name }}' to match pattern '{{pattern}}'.",
		},
	},

	create(context) {
		let layerDepth = 0;
		const options = context.options[0];
		const layerNameRegex = options.layerNamePattern
			? new RegExp(options.layerNamePattern, "u")
			: null;

		return {
			"Atrule[name=import]"(node) {
				// layer, if present, must always be the second child of the prelude
				const secondChild = node.prelude.children[1];
				const layerNode =
					secondChild?.name === "layer" ? secondChild : null;

				if (options.requireImportLayers && !layerNode) {
					context.report({
						loc: node.loc,
						messageId: "missingImportLayer",
					});
				}

				if (layerNode) {
					const isLayerFunction = layerNode.type === "Function";

					if (!options.allowUnnamedLayers && !isLayerFunction) {
						context.report({
							loc: layerNode.loc,
							messageId: "missingLayerName",
						});
					}
				}
			},

			Layer(node) {
				if (!layerNameRegex) {
					return;
				}

				const parts = node.name.split(".");
				let currentPos = 0;

				parts.forEach((part, index) => {
					if (!layerNameRegex.test(part)) {
						const startColumn = node.loc.start.column + currentPos;
						const endColumn = startColumn + part.length;

						context.report({
							loc: {
								start: {
									line: node.loc.start.line,
									column: startColumn,
								},
								end: {
									line: node.loc.start.line,
									column: endColumn,
								},
							},
							messageId: "layerNameMismatch",
							data: {
								name: part,
								pattern: options.layerNamePattern,
							},
						});
					}

					currentPos += part.length;
					// add 1 to account for the . symbol
					if (index < parts.length - 1) {
						currentPos += 1;
					}
				});
			},

			"Atrule[name=layer]"(node) {
				layerDepth++;

				if (!options.allowUnnamedLayers && !node.prelude) {
					context.report({
						loc: node.loc,
						messageId: "missingLayerName",
					});
				}
			},

			"Atrule[name=layer]:exit"() {
				layerDepth--;
			},

			Rule(node) {
				if (layerDepth > 0) {
					return;
				}

				context.report({
					loc: node.loc,
					messageId: "missingLayer",
				});
			},
		};
	},
};
