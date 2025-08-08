import css, { CSSSourceCode } from "@eslint/css";
import { ESLint } from "eslint";
import type { SourceLocation, SourceRange } from "@eslint/core";
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
} from "@eslint/css-tree";
import type { CSSRuleDefinition, CSSRuleVisitor } from "@eslint/css/types";

css satisfies ESLint.Plugin;
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

(): CSSRuleDefinition => ({
	create({ sourceCode }): CSSRuleVisitor {
		sourceCode satisfies CSSSourceCode;
		sourceCode.ast satisfies StyleSheetPlain;
		sourceCode.lines satisfies string[];
		sourceCode.text satisfies string;

		function testVisitor<NodeType extends CssNodePlain>(node: NodeType) {
			sourceCode.getLoc(node) satisfies SourceLocation;
			sourceCode.getRange(node) satisfies SourceRange;
			sourceCode.getParent(node) satisfies CssNodePlain | undefined;
			sourceCode.getAncestors(node) satisfies CssNodePlain[];
			sourceCode.getText(node) satisfies string;
		}

		return {
			AnPlusB: node => testVisitor<AnPlusB>(node),
			"AnPlusB:exit": node => testVisitor<AnPlusB>(node),
			Atrule: node => testVisitor<AtrulePlain>(node),
			"Atrule:exit": node => testVisitor<AtrulePlain>(node),
			AtrulePrelude: node => testVisitor<AtrulePreludePlain>(node),
			"AtrulePrelude:exit": node => testVisitor<AtrulePreludePlain>(node),
			AttributeSelector: node => testVisitor<AttributeSelector>(node),
			"AttributeSelector:exit": node =>
				testVisitor<AttributeSelector>(node),
			Block: node => testVisitor<BlockPlain>(node),
			"Block:exit": node => testVisitor<BlockPlain>(node),
			Brackets: node => testVisitor<BracketsPlain>(node),
			"Brackets:exit": node => testVisitor<BracketsPlain>(node),
			CDC: node => testVisitor<CDC>(node),
			"CDC:exit": node => testVisitor<CDC>(node),
			CDO: node => testVisitor<CDO>(node),
			"CDO:exit": node => testVisitor<CDO>(node),
			ClassSelector: node => testVisitor<ClassSelector>(node),
			"ClassSelector:exit": node => testVisitor<ClassSelector>(node),
			Combinator: node => testVisitor<Combinator>(node),
			"Combinator:exit": node => testVisitor<Combinator>(node),
			Comment: node => testVisitor<Comment>(node),
			"Comment:exit": node => testVisitor<Comment>(node),
			Condition: node => testVisitor<ConditionPlain>(node),
			"Condition:exit": node => testVisitor<ConditionPlain>(node),
			Declaration: node => testVisitor<DeclarationPlain>(node),
			"Declaration:exit": node => testVisitor<DeclarationPlain>(node),
			DeclarationList: node => testVisitor<DeclarationListPlain>(node),
			"DeclarationList:exit": node =>
				testVisitor<DeclarationListPlain>(node),
			Dimension: node => testVisitor<Dimension>(node),
			"Dimension:exit": node => testVisitor<Dimension>(node),
			Feature: node => testVisitor<Feature>(node),
			"Feature:exit": node => testVisitor<Feature>(node),
			FeatureFunction: node => testVisitor<FeatureFunctionPlain>(node),
			"FeatureFunction:exit": node =>
				testVisitor<FeatureFunctionPlain>(node),
			FeatureRange: node => testVisitor<FeatureRange>(node),
			"FeatureRange:exit": node => testVisitor<FeatureRange>(node),
			Function: node => testVisitor<FunctionNodePlain>(node),
			"Function:exit": node => testVisitor<FunctionNodePlain>(node),
			GeneralEnclosed: node => testVisitor<any>(node),
			"GeneralEnclosed:exit": node => testVisitor<any>(node),
			Hash: node => testVisitor<Hash>(node),
			"Hash:exit": node => testVisitor<Hash>(node),
			IdSelector: node => testVisitor<IdSelector>(node),
			"IdSelector:exit": node => testVisitor<IdSelector>(node),
			Identifier: node => testVisitor<Identifier>(node),
			"Identifier:exit": node => testVisitor<Identifier>(node),
			Layer: node => testVisitor<Layer>(node),
			"Layer:exit": node => testVisitor<Layer>(node),
			LayerList: node => testVisitor<LayerListPlain>(node),
			"LayerList:exit": node => testVisitor<LayerListPlain>(node),
			MediaFeature: node => testVisitor<MediaFeature>(node),
			"MediaFeature:exit": node => testVisitor<MediaFeature>(node),
			MediaQuery: node => testVisitor<MediaQueryPlain>(node),
			"MediaQuery:exit": node => testVisitor<MediaQueryPlain>(node),
			MediaQueryList: node => testVisitor<MediaQueryListPlain>(node),
			"MediaQueryList:exit": node =>
				testVisitor<MediaQueryListPlain>(node),
			NestingSelector: node => testVisitor<NestingSelector>(node),
			"NestingSelector:exit": node => testVisitor<NestingSelector>(node),
			Nth: node => testVisitor<NthPlain>(node),
			"Nth:exit": node => testVisitor<NthPlain>(node),
			Number: node => testVisitor<NumberNode>(node),
			"Number:exit": node => testVisitor<NumberNode>(node),
			Operator: node => testVisitor<Operator>(node),
			"Operator:exit": node => testVisitor<Operator>(node),
			Parentheses: node => testVisitor<ParenthesesPlain>(node),
			"Parentheses:exit": node => testVisitor<ParenthesesPlain>(node),
			Percentage: node => testVisitor<Percentage>(node),
			"Percentage:exit": node => testVisitor<Percentage>(node),
			PseudoClassSelector: node =>
				testVisitor<PseudoClassSelectorPlain>(node),
			"PseudoClassSelector:exit": node =>
				testVisitor<PseudoClassSelectorPlain>(node),
			PseudoElementSelector: node =>
				testVisitor<PseudoElementSelectorPlain>(node),
			"PseudoElementSelector:exit": node =>
				testVisitor<PseudoElementSelectorPlain>(node),
			Ratio: node => testVisitor<Ratio>(node),
			"Ratio:exit": node => testVisitor<Ratio>(node),
			Raw: node => testVisitor<Raw>(node),
			"Raw:exit": node => testVisitor<Raw>(node),
			Rule: node => testVisitor<RulePlain>(node),
			"Rule:exit": node => testVisitor<RulePlain>(node),
			Scope: node => testVisitor<any>(node),
			"Scope:exit": node => testVisitor<any>(node),
			Selector: node => testVisitor<SelectorPlain>(node),
			"Selector:exit": node => testVisitor<SelectorPlain>(node),
			SelectorList: node => testVisitor<SelectorListPlain>(node),
			"SelectorList:exit": node => testVisitor<SelectorListPlain>(node),
			String: node => testVisitor<StringNode>(node),
			"String:exit": node => testVisitor<StringNode>(node),
			StyleSheet: node => testVisitor<StyleSheetPlain>(node),
			"StyleSheet:exit": node => testVisitor<StyleSheetPlain>(node),
			SupportsDeclaration: node => testVisitor<SupportsDeclaration>(node),
			"SupportsDeclaration:exit": node =>
				testVisitor<SupportsDeclaration>(node),
			TypeSelector: node => testVisitor<TypeSelector>(node),
			"TypeSelector:exit": node => testVisitor<TypeSelector>(node),
			UnicodeRange: node => testVisitor<UnicodeRange>(node),
			"UnicodeRange:exit": node => testVisitor<UnicodeRange>(node),
			Url: node => testVisitor<Url>(node),
			"Url:exit": node => testVisitor<Url>(node),
			Value: node => testVisitor<ValuePlain>(node),
			"Value:exit": node => testVisitor<ValuePlain>(node),
			WhiteSpace: node => testVisitor<WhiteSpace>(node),
			"WhiteSpace:exit": node => testVisitor<WhiteSpace>(node),
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
