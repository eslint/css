import css from "@eslint/css";
import type {
	CSSRuleDefinition,
	CSSRuleVisitor,
	CSSSourceCode,
} from "@eslint/css";
import type { Plugin, SourceLocation, SourceRange } from "@eslint/core";
import type {
	AnPlusB,
	AtrulePlain,
	AtrulePreludePlain,
	AttributeSelector,
	BlockPlain,
	BracketsPlain,
	CDC,
	CDO,
	ClassSelector,
	Combinator,
	Comment,
	ConditionPlain,
	DeclarationListPlain,
	DeclarationPlain,
	Dimension,
	Feature,
	FeatureFunctionPlain,
	FeatureRange,
	FunctionNodePlain,
	Hash,
	IdSelector,
	Identifier,
	Layer,
	LayerListPlain,
	MediaFeature,
	MediaQueryListPlain,
	MediaQueryPlain,
	NestingSelector,
	NthPlain,
	NumberNode,
	Operator,
	ParenthesesPlain,
	Percentage,
	PseudoClassSelectorPlain,
	PseudoElementSelectorPlain,
	Ratio,
	Raw,
	RulePlain,
	SelectorListPlain,
	SelectorPlain,
	StringNode,
	StyleSheetPlain,
	SupportsDeclaration,
	TypeSelector,
	UnicodeRange,
	Url,
	ValuePlain,
	WhiteSpace,
	CssNodePlain,
	CssLocationRange,
} from "@eslint/css-tree";

css satisfies Plugin;
css.meta.name satisfies string;
css.meta.version satisfies string;

// Check that these languages are defined:
css.languages.css satisfies object;

// Check that `plugins` in the recommended config is defined:
css.configs.recommended.plugins satisfies object;

{
	type RecommendedRuleName = keyof typeof css.configs.recommended.rules;
	type RuleName = `css/${keyof typeof css.rules}`;
	type AssertAllNamesIn<T1 extends T2, T2> = never;

	// Check that all recommended rule names match the names of existing rules in this plugin.
	null as AssertAllNamesIn<RecommendedRuleName, RuleName>;
}

{
	type ApplyInlineConfigLoc = ReturnType<
		CSSSourceCode["applyInlineConfig"]
	>["configs"][0]["loc"];

	// Check that `applyInlineConfig`'s return type includes correct `loc` structure.
	const loc: ApplyInlineConfigLoc = {
		source: "source",
		start: { line: 1, column: 1, offset: 0 },
		end: { line: 1, column: 1, offset: 0 },
	};
}

(): CSSRuleDefinition => ({
	create({ sourceCode }): CSSRuleVisitor {
		sourceCode satisfies CSSSourceCode;
		sourceCode.ast satisfies StyleSheetPlain;
		sourceCode.lines satisfies string[];
		sourceCode.text satisfies string;

		function testVisitor<NodeType extends CssNodePlain>(
			node: NodeType,
			parent?: CssNodePlain,
		) {
			sourceCode.getLoc(node) satisfies SourceLocation;
			sourceCode.getLocFromIndex(0) satisfies {
				line: number;
				column: number;
			};
			sourceCode.getIndexFromLoc({ line: 1, column: 1 }) satisfies number;
			sourceCode.getRange(node) satisfies SourceRange;
			sourceCode.getParent(node) satisfies CssNodePlain | undefined;
			sourceCode.getAncestors(node) satisfies CssNodePlain[];
			sourceCode.getText(node) satisfies string;
			sourceCode.applyInlineConfig().configs[0].loc
				.source satisfies CssLocationRange["source"];
			sourceCode.applyInlineConfig().configs[0].loc.start
				.offset satisfies CssLocationRange["start"]["offset"];
			sourceCode.applyInlineConfig().configs[0].loc.end
				.offset satisfies CssLocationRange["end"]["offset"];
		}

		return {
			AnPlusB: (...args) => testVisitor<AnPlusB>(...args),
			"AnPlusB:exit": (...args) => testVisitor<AnPlusB>(...args),
			Atrule: (...args) => testVisitor<AtrulePlain>(...args),
			"Atrule:exit": (...args) => testVisitor<AtrulePlain>(...args),
			AtrulePrelude: (...args) =>
				testVisitor<AtrulePreludePlain>(...args),
			"AtrulePrelude:exit": (...args) =>
				testVisitor<AtrulePreludePlain>(...args),
			AttributeSelector: (...args) =>
				testVisitor<AttributeSelector>(...args),
			"AttributeSelector:exit": (...args) =>
				testVisitor<AttributeSelector>(...args),
			Block: (...args) => testVisitor<BlockPlain>(...args),
			"Block:exit": (...args) => testVisitor<BlockPlain>(...args),
			Brackets: (...args) => testVisitor<BracketsPlain>(...args),
			"Brackets:exit": (...args) => testVisitor<BracketsPlain>(...args),
			CDC: (...args) => testVisitor<CDC>(...args),
			"CDC:exit": (...args) => testVisitor<CDC>(...args),
			CDO: (...args) => testVisitor<CDO>(...args),
			"CDO:exit": (...args) => testVisitor<CDO>(...args),
			ClassSelector: (...args) => testVisitor<ClassSelector>(...args),
			"ClassSelector:exit": (...args) =>
				testVisitor<ClassSelector>(...args),
			Combinator: (...args) => testVisitor<Combinator>(...args),
			"Combinator:exit": (...args) => testVisitor<Combinator>(...args),
			Comment: (...args) => testVisitor<Comment>(...args),
			"Comment:exit": (...args) => testVisitor<Comment>(...args),
			Condition: (...args) => testVisitor<ConditionPlain>(...args),
			"Condition:exit": (...args) => testVisitor<ConditionPlain>(...args),
			Declaration: (...args) => testVisitor<DeclarationPlain>(...args),
			"Declaration:exit": (...args) =>
				testVisitor<DeclarationPlain>(...args),
			DeclarationList: (...args) =>
				testVisitor<DeclarationListPlain>(...args),
			"DeclarationList:exit": (...args) =>
				testVisitor<DeclarationListPlain>(...args),
			Dimension: (...args) => testVisitor<Dimension>(...args),
			"Dimension:exit": (...args) => testVisitor<Dimension>(...args),
			Feature: (...args) => testVisitor<Feature>(...args),
			"Feature:exit": (...args) => testVisitor<Feature>(...args),
			FeatureFunction: (...args) =>
				testVisitor<FeatureFunctionPlain>(...args),
			"FeatureFunction:exit": (...args) =>
				testVisitor<FeatureFunctionPlain>(...args),
			FeatureRange: (...args) => testVisitor<FeatureRange>(...args),
			"FeatureRange:exit": (...args) =>
				testVisitor<FeatureRange>(...args),
			Function: (...args) => testVisitor<FunctionNodePlain>(...args),
			"Function:exit": (...args) =>
				testVisitor<FunctionNodePlain>(...args),
			GeneralEnclosed: (node: any, parent: CssNodePlain) =>
				testVisitor<any>(node, parent),
			"GeneralEnclosed:exit": (node: any, parent: CssNodePlain) =>
				testVisitor<any>(node, parent),
			Hash: (...args) => testVisitor<Hash>(...args),
			"Hash:exit": (...args) => testVisitor<Hash>(...args),
			IdSelector: (...args) => testVisitor<IdSelector>(...args),
			"IdSelector:exit": (...args) => testVisitor<IdSelector>(...args),
			Identifier: (...args) => testVisitor<Identifier>(...args),
			"Identifier:exit": (...args) => testVisitor<Identifier>(...args),
			Layer: (...args) => testVisitor<Layer>(...args),
			"Layer:exit": (...args) => testVisitor<Layer>(...args),
			LayerList: (...args) => testVisitor<LayerListPlain>(...args),
			"LayerList:exit": (...args) => testVisitor<LayerListPlain>(...args),
			MediaFeature: (...args) => testVisitor<MediaFeature>(...args),
			"MediaFeature:exit": (...args) =>
				testVisitor<MediaFeature>(...args),
			MediaQuery: (...args) => testVisitor<MediaQueryPlain>(...args),
			"MediaQuery:exit": (...args) =>
				testVisitor<MediaQueryPlain>(...args),
			MediaQueryList: (...args) =>
				testVisitor<MediaQueryListPlain>(...args),
			"MediaQueryList:exit": (...args) =>
				testVisitor<MediaQueryListPlain>(...args),
			NestingSelector: (...args) => testVisitor<NestingSelector>(...args),
			"NestingSelector:exit": (...args) =>
				testVisitor<NestingSelector>(...args),
			Nth: (...args) => testVisitor<NthPlain>(...args),
			"Nth:exit": (...args) => testVisitor<NthPlain>(...args),
			Number: (...args) => testVisitor<NumberNode>(...args),
			"Number:exit": (...args) => testVisitor<NumberNode>(...args),
			Operator: (...args) => testVisitor<Operator>(...args),
			"Operator:exit": (...args) => testVisitor<Operator>(...args),
			Parentheses: (...args) => testVisitor<ParenthesesPlain>(...args),
			"Parentheses:exit": (...args) =>
				testVisitor<ParenthesesPlain>(...args),
			Percentage: (...args) => testVisitor<Percentage>(...args),
			"Percentage:exit": (...args) => testVisitor<Percentage>(...args),
			PseudoClassSelector: (...args) =>
				testVisitor<PseudoClassSelectorPlain>(...args),
			"PseudoClassSelector:exit": (...args) =>
				testVisitor<PseudoClassSelectorPlain>(...args),
			PseudoElementSelector: (...args) =>
				testVisitor<PseudoElementSelectorPlain>(...args),
			"PseudoElementSelector:exit": (...args) =>
				testVisitor<PseudoElementSelectorPlain>(...args),
			Ratio: (...args) => testVisitor<Ratio>(...args),
			"Ratio:exit": (...args) => testVisitor<Ratio>(...args),
			Raw: (...args) => testVisitor<Raw>(...args),
			"Raw:exit": (...args) => testVisitor<Raw>(...args),
			Rule: (...args) => testVisitor<RulePlain>(...args),
			"Rule:exit": (...args) => testVisitor<RulePlain>(...args),
			Scope: (node: any, parent: CssNodePlain) =>
				testVisitor<any>(node, parent),
			"Scope:exit": (node: any, parent: CssNodePlain) =>
				testVisitor<any>(node, parent),
			Selector: (...args) => testVisitor<SelectorPlain>(...args),
			"Selector:exit": (...args) => testVisitor<SelectorPlain>(...args),
			SelectorList: (...args) => testVisitor<SelectorListPlain>(...args),
			"SelectorList:exit": (...args) =>
				testVisitor<SelectorListPlain>(...args),
			String: (...args) => testVisitor<StringNode>(...args),
			"String:exit": (...args) => testVisitor<StringNode>(...args),
			StyleSheet: (...args) => testVisitor<StyleSheetPlain>(...args),
			"StyleSheet:exit": (...args) =>
				testVisitor<StyleSheetPlain>(...args),
			SupportsDeclaration: (...args) =>
				testVisitor<SupportsDeclaration>(...args),
			"SupportsDeclaration:exit": (...args) =>
				testVisitor<SupportsDeclaration>(...args),
			TypeSelector: (...args) => testVisitor<TypeSelector>(...args),
			"TypeSelector:exit": (...args) =>
				testVisitor<TypeSelector>(...args),
			UnicodeRange: (...args) => testVisitor<UnicodeRange>(...args),
			"UnicodeRange:exit": (...args) =>
				testVisitor<UnicodeRange>(...args),
			Url: (...args) => testVisitor<Url>(...args),
			"Url:exit": (...args) => testVisitor<Url>(...args),
			Value: (...args) => testVisitor<ValuePlain>(...args),
			"Value:exit": (...args) => testVisitor<ValuePlain>(...args),
			WhiteSpace: (...args) => testVisitor<WhiteSpace>(...args),
			"WhiteSpace:exit": (...args) => testVisitor<WhiteSpace>(...args),

			// Combined selectors allowed
			"Atrule[name=import]"(node: AtrulePlain, parent: CssNodePlain) {},
			"*"(node: CssNodePlain) {},
			"Selector:first-child"(node: SelectorPlain) {},
			"Selector:last-child"(node: SelectorPlain) {},
			"Value Number"(node: NumberNode) {},
			"String, Number"(node: StringNode | NumberNode) {},

			// Unknown selectors allowed
			ForStatement(node) {},
			Unknown(node) {},
			ValueNode(node) {},
		};
	},
});

// All options optional - CSSRuleDefinition and CSSRuleDefinition<{}>
// should be the same type.
(rule1: CSSRuleDefinition, rule2: CSSRuleDefinition<{}>) => {
	rule1 satisfies typeof rule2;
	rule2 satisfies typeof rule1;
};

// Type restrictions should be enforced
(): CSSRuleDefinition<{
	RuleOptions: [string, number];
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: string; bar: number };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// @ts-expect-error Wrong type for message ID
			bar: 42,
		},
		docs: {
			foo: "FOO",

			// @ts-expect-error Wrong type for declared property
			bar: "BAR",

			// @ts-expect-error Wrong type for predefined property
			description: 42,
		},
	},
	create({ options }) {
		// Types for rule options
		options[0] satisfies string;
		options[1] satisfies number;

		return {};
	},
});

// Undeclared properties should produce an error
(): CSSRuleDefinition<{
	MessageIds: "foo" | "bar";
	ExtRuleDocs: { foo: number; bar: string };
}> => ({
	meta: {
		messages: {
			foo: "FOO",

			// Declared message ID is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared message ID is not allowed
			baz: "BAZ",
		},
		docs: {
			foo: 42,

			// Declared property is not required
			// bar: "BAR",

			// @ts-expect-error Undeclared property key is not allowed
			baz: "BAZ",

			// Predefined property is allowed
			description: "Lorem ipsum",
		},
	},
	create() {
		return {};
	},
});

// `meta.docs.recommended` can be any type
(): CSSRuleDefinition => ({
	create() {
		return {};
	},
	meta: {
		docs: {
			recommended: {
				severity: "warn",
				options: ["never"],
			},
		},
	},
});
