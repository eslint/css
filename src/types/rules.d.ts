/**
 * @fileoverview This file contains the rule types for this package.
 * @author thecalamiity
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { Linter } from "eslint";

//------------------------------------------------------------------------------
// Types
//------------------------------------------------------------------------------

export interface CSSRules extends Linter.RulesRecord {
	/**
	 * Rule to disallow duplicate @import rules.
	 *
	 * @remarks
	 * Recommended by ESLint, the rule was enabled in `css/recommended`.
	 *
	 * @since 0.1.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/no-duplicate-imports.md
	 */
	"no-duplicate-imports": Linter.RuleEntry<[]>;
	/**
	 * Rule to disallow empty blocks.
	 *
	 * @remarks
	 * Recommended by ESLint, the rule was enabled in `css/recommended`.
	 *
	 * @since 0.1.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/no-empty-blocks.md
	 */
	"no-empty-blocks": Linter.RuleEntry<[]>;
	/**
	 * Rule to disallow invalid at-rules.
	 *
	 * @remarks
	 * Recommended by ESLint, the rule was enabled in `css/recommended`.
	 *
	 * @since 0.1.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/no-invalid-at-rules.md
	 */
	"no-invalid-at-rules": Linter.RuleEntry<[]>;
	/**
	 * Rule to disallow invalid properties.
	 *
	 * @remarks
	 * Recommended by ESLint, the rule was enabled in `css/recommended`.
	 *
	 * @since 0.1.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/no-invalid-properties.md
	 */
	"no-invalid-properties": Linter.RuleEntry<[]>;
	/**
	 * Rule to enforce the use of logical properties.
	 *
	 * @since 0.5.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/prefer-logical-properties.md
	 */
	"prefer-logical-properties": Linter.RuleEntry<
		[
			Partial<{
				allowProperties: string[];
				allowUnits: string[];
			}>,
		]
	>;
	/**
	 * Rule to enforce the use of baseline features.
	 *
	 * @remarks
	 * Recommended by ESLint, the rule was enabled in `css/recommended`.
	 *
	 * @since 0.6.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md
	 */
	"use-baseline": Linter.RuleEntry<
		[
			Partial<{
				/**
				 * @default "widely"
				 */
				available: number | "widely" | "newely";
			}>,
		]
	>;
	/**
	 * Rule to require use of layers.
	 *
	 * @since 0.3.0
	 * @see https://github.com/eslint/css/blob/main/docs/rules/use-layers.md
	 */
	"use-layers": Linter.RuleEntry<
		[
			Partial<{
				/**
				 * @default false
				 */
				allowUnnamedLayers: boolean;
				/**
				 * @default true
				 */
				requireImportLayers: boolean;
				layerNamePattern: string;
			}>,
		]
	>;
}
