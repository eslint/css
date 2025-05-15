/**
 * @fileoverview CSS plugin.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { CSSLanguage } from "./languages/css-language.js";
import { CSSSourceCode } from "./languages/css-source-code.js";
import noEmptyBlocks from "./rules/no-empty-blocks.js";
import noDuplicateImports from "./rules/no-duplicate-imports.js";
import noImportant from "./rules/no-important.js";
import noInvalidProperties from "./rules/no-invalid-properties.js";
import noInvalidAtRules from "./rules/no-invalid-at-rules.js";
import preferLogicalProperties from "./rules/prefer-logical-properties.js";
import useLayers from "./rules/use-layers.js";
import useBaseline from "./rules/use-baseline.js";

//-----------------------------------------------------------------------------
// Plugin
//-----------------------------------------------------------------------------

const plugin = {
	meta: {
		name: "@eslint/css",
		version: "0.8.0", // x-release-please-version
	},
	languages: {
		css: new CSSLanguage(),
	},
	rules: {
		"no-empty-blocks": noEmptyBlocks,
		"no-duplicate-imports": noDuplicateImports,
		"no-important": noImportant,
		"no-invalid-at-rules": noInvalidAtRules,
		"no-invalid-properties": noInvalidProperties,
		"prefer-logical-properties": preferLogicalProperties,
		"use-layers": useLayers,
		"use-baseline": useBaseline,
	},
	configs: {
		recommended: {
			plugins: {},
			rules: /** @type {const} */ ({
				"css/no-empty-blocks": "error",
				"css/no-duplicate-imports": "error",
				"css/no-important": "error",
				"css/no-invalid-at-rules": "error",
				"css/no-invalid-properties": "error",
				"css/use-baseline": "warn",
			}),
		},
	},
};

// eslint-disable-next-line no-lone-blocks -- The block syntax { ... } ensures that TypeScript does not get confused about the type of `plugin`.
{
	plugin.configs.recommended.plugins.css = plugin;
}

export default plugin;
export { CSSSourceCode };
export * from "./languages/css-language.js";
