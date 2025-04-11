/**
 * @fileoverview Additional types for this package.
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import type { RuleVisitor, RuleDefinition } from "@eslint/core";

import type { CssNodePlain, CssNodeNames } from "@eslint/css-tree";

import type { CSSLanguageOptions, CSSSourceCode } from "./index.js";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/** Adds matching `:exit` selectors for all properties of a `RuleVisitor`. */
type WithExit<RuleVisitorType extends RuleVisitor> = {
	[Key in keyof RuleVisitorType as
		| Key
		| `${Key & string}:exit`]: RuleVisitorType[Key];
};

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

/**
 * A CSS syntax element, including nodes and comments.
 */
export type CSSSyntaxElement = CssNodePlain | Comment;

type CSSNodeVisitor = {
	[Type in CssNodeNames]: (
		node: Extract<CssNodePlain, { type: Type }>,
	) => void;
};

/**
 * A visitor for CSS nodes.
 */
export interface CSSRuleVisitor
	extends RuleVisitor,
		Partial<WithExit<CSSNodeVisitor>> {}

export type CSSRuleDefinitionTypeOptions = {
	RuleOptions: unknown[];
	MessageIds: string;
	ExtRuleDocs: Record<string, unknown>;
};

/**
 * A rule definition for CSS.
 */
export type CSSRuleDefinition<
	Options extends Partial<CSSRuleDefinitionTypeOptions> = {},
> = RuleDefinition<
	// Language specific type options (non-configurable)
	{
		LangOptions: CSSLanguageOptions;
		Code: CSSSourceCode;
		Visitor: CSSRuleVisitor;
		Node: CssNodePlain;
	} & Required<
		// Rule specific type options (custom)
		Options &
			// Rule specific type options (defaults)
			Omit<CSSRuleDefinitionTypeOptions, keyof Options>
	>
>;
