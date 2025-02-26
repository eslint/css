//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const propertiesReplacements = new Map([
	["bottom", "inset-block-end"],
	["border-bottom", "border-block-end"],
	["border-bottom-color", "border-block-end-color"],
	["border-bottom-left-radius", "border-end-start-radius"],
	["border-bottom-right-radius", "border-end-end-radius"],
	["border-bottom-style", "border-block-end-style"],
	["border-bottom-width", "border-block-end-width"],
	["border-left", "border-inline-start"],
	["border-left-color", "border-inline-start-color"],
	["border-left-style", "border-inline-start-style"],
	["border-left-width", "border-inline-start-width"],
	["border-right", "border-inline-end"],
	["border-right-color", "border-inline-end-color"],
	["border-right-style", "border-inline-end-style"],
	["border-right-width", "border-inline-end-width"],
	["border-top", "border-block-start"],
	["border-top-color", "border-block-start-color"],
	["border-top-left-radius", "border-start-start-radius"],
	["border-top-right-radius", "border-start-end-radius"],
	["border-top-style", "border-block-start-style"],
	["border-top-width", "border-block-start-width"],
	["contain-intrinsic-height", "contain-intrinsic-block-size"],
	["contain-intrinsic-width", "contain-intrinsic-inline-size"],
	["height", "block-size"],
	["left", "inset-inline-start"],
	["margin-bottom", "margin-block-end"],
	["margin-left", "margin-inline-start"],
	["margin-right", "margin-inline-end"],
	["margin-top", "margin-block-start"],
	["max-height", "max-block-size"],
	["max-width", "max-inline-size"],
	["min-height", "min-block-size"],
	["min-width", "min-inline-size"],
	["overflow-x", "overflow-inline"],
	["overflow-y", "overflow-block"],
	["overscroll-behavior-x", "overscroll-behavior-inline"],
	["overscroll-behavior-y", "overscroll-behavior-block"],
	["padding-bottom", "padding-block-end"],
	["padding-left", "padding-inline-start"],
	["padding-right", "padding-inline-end"],
	["padding-top", "padding-block-start"],
	["right", "inset-inline-end"],
	["scroll-margin-bottom", "scroll-margin-block-end"],
	["scroll-margin-left", "scroll-margin-inline-start"],
	["scroll-margin-right", "scroll-margin-inline-end"],
	["scroll-margin-top", "scroll-margin-block-start"],
	["scroll-padding-bottom", "scroll-padding-block-end"],
	["scroll-padding-left", "scroll-padding-inline-start"],
	["scroll-padding-right", "scroll-padding-inline-end"],
	["scroll-padding-top", "scroll-padding-block-start"],
	["top", "inset-block-start"],
	["width", "inline-size"],
]);

const propertyValuesReplacements = new Map([
	[
		"text-align",
		{
			left: "start",
			right: "end",
		},
	],
	[
		"resize",
		{
			horizontal: "inline",
			vertical: "block",
		},
	],
	[
		"caption-side",
		{
			left: "inline-start",
			right: "inline-end",
		},
	],
	[
		"box-orient",
		{
			horizontal: "inline-axis",
			vertical: "block-axis",
		},
	],
	[
		"float",
		{
			left: "inline-start",
			right: "inline-end",
		},
	],
	[
		"clear",
		{
			left: "inline-start",
			right: "inline-end",
		},
	],
]);

const unitReplacements = new Map([
	["cqh", "cqb"],
	["cqw", "cqi"],
	["dvh", "dvb"],
	["dvw", "dvi"],
	["lvh", "lvb"],
	["lvw", "lvi"],
	["svh", "svb"],
	["svw", "svi"],
	["vh", "vb"],
	["vw", "vi"],
]);

//-----------------------------------------------------------------------------
// Rule Definition
//-----------------------------------------------------------------------------
export default {
	meta: {
		type: /** @type {const} */ ("problem"),

		fixable: "code",

		docs: {
			description: "Enforce the use of logical properties",
			url: "https://github.com/eslint/css/blob/main/docs/rules/prefer-logical-properties.md",
		},

		messages: {
			notLogicalProperty:
				"Expected logical property '{{replacement}}' instead of '{{property}}'.",
			notLogicalValue:
				"Expected logical value '{{replacement}}' instead of '{{value}}'.",
			notLogicalUnit:
				"Expected logical unit '{{replacement}}' instead of '{{unit}}'.",
		},
	},

	create(context) {
		return {
			Declaration(node) {
				if (propertiesReplacements.get(node.property)) {
					context.report({
						loc: node.loc,
						messageId: "notLogicalProperty",
						data: {
							property: node.property,
							replacement: propertiesReplacements.get(
								node.property,
							),
						},
					});
				}

				if (
					propertyValuesReplacements.get(node.property) &&
					node.value.children[0].type === "Identifier"
				) {
					const nodeValue = node.value.children[0].name;
					if (
						propertyValuesReplacements.get(node.property)[nodeValue]
					) {
						const replacement = propertyValuesReplacements.get(
							node.property,
						)[nodeValue];
						if (replacement) {
							context.report({
								loc: node.value.children[0].loc,
								messageId: "notLogicalValue",
								data: {
									value: nodeValue,
									replacement,
								},
							});
						}
					}
				}
			},
			Dimension(node) {
				if (unitReplacements.get(node.unit)) {
					context.report({
						loc: node.loc,
						messageId: "notLogicalUnit",
						data: {
							unit: node.unit,
							replacement: unitReplacements.get(node.unit),
						},
					});
				}
			},
		};
	},
};
