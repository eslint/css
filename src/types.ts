/**
 * @fileoverview Additional types for this package.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type { LanguageOptions, RuleVisitor } from "@eslint/core";
import type {
	CssNodePlain,
	StyleSheetPlain,
	SyntaxConfig,
} from "@eslint/css-tree";
import type {
	CustomRuleDefinitionType,
	CustomRuleTypeDefinitions,
	CustomRuleVisitorWithExit,
} from "@eslint/plugin-kit";
import type { CSSSourceCode } from "./index.js";

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/**
 * Default syntax configuration representing the structure returned by
 * `@eslint/css-tree/definition-syntax-data`.
 */
export type DefaultSyntaxConfig = Pick<
	SyntaxConfig,
	"atrules" | "types" | "properties"
>;

/**
 * A callback used to extend the default CSS syntax configuration.
 */
export type SyntaxExtensionCallback = (
	defaultSyntax: DefaultSyntaxConfig,
) => Partial<SyntaxConfig>;

/**
 * Language options provided for CSS files.
 */
export interface CSSLanguageOptions extends LanguageOptions {
	/**
	 * Whether to be tolerant of recoverable parsing errors.
	 * @default false
	 */
	tolerant?: boolean;

	/**
	 * Custom syntax to use for parsing.
	 */
	customSyntax?: Partial<SyntaxConfig> | SyntaxExtensionCallback;
}

/**
 * A CSS syntax element, including nodes and comments.
 */
export type CSSSyntaxElement = CssNodePlain;

type CSSNodeVisitor = {
	[Node in CssNodePlain as Node["type"]]: Node extends StyleSheetPlain
		? ((node: Node) => void) | undefined
		: ((node: Node, parent: CssNodePlain) => void) | undefined;
};

/**
 * A visitor for CSS nodes.
 */
export interface CSSRuleVisitor
	extends RuleVisitor, Partial<CustomRuleVisitorWithExit<CSSNodeVisitor>> {}

export type CSSRuleDefinitionTypeOptions = CustomRuleTypeDefinitions;

/**
 * A rule definition for CSS.
 */
export type CSSRuleDefinition<
	Options extends Partial<CSSRuleDefinitionTypeOptions> = {},
> = CustomRuleDefinitionType<
	{
		LangOptions: CSSLanguageOptions;
		Code: CSSSourceCode;
		Visitor: CSSRuleVisitor;
		Node: CSSSyntaxElement;
	},
	Options
>;
