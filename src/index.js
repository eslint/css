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
import noInvalidProperties from "./rules/no-invalid-properties.js";
import noInvalidAtRules from "./rules/no-invalid-at-rules.js";
import useLayers from "./rules/use-layers.js";
import baseline from "./rules/baseline.js";

//-----------------------------------------------------------------------------
// Plugin
//-----------------------------------------------------------------------------

const plugin = {
	meta: {
		name: "@eslint/css",
		version: "0.2.0", // x-release-please-version
	},
	languages: {
		css: new CSSLanguage(),
	},
	rules: {
		"no-empty-blocks": noEmptyBlocks,
		"no-duplicate-imports": noDuplicateImports,
		"no-invalid-at-rules": noInvalidAtRules,
		"no-invalid-properties": noInvalidProperties,
		"use-layers": useLayers,
		baseline,
	},
	configs: {
		recommended: {
			plugins: {},
			rules: /** @type {const} */ ({
				"css/no-empty-blocks": "error",
				"css/no-duplicate-imports": "error",
				"css/no-invalid-at-rules": "error",
				"css/no-invalid-properties": "error",
				"css/baseline": "error",
			}),
		},
	},
};

// eslint-disable-next-line no-lone-blocks -- The block syntax { ... } ensures that TypeScript does not get confused about the type of `plugin`.
{
	plugin.configs.recommended.plugins.css = plugin;
}

export default plugin;
export { CSSLanguage, CSSSourceCode };
