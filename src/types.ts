/**
 * @fileoverview Additional types for this package.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type { RuleVisitor } from "@eslint/core";
import type { CssNodePlain, StyleSheetPlain } from "@eslint/css-tree";
import type {
	CustomRuleDefinitionType,
	CustomRuleTypeDefinitions,
	CustomRuleVisitorWithExit,
} from "@eslint/plugin-kit";
import type { CSSLanguageOptions, CSSSourceCode } from "./index.js";

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

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
