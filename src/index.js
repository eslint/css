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
import noUnknownProperties from "./rules/no-unknown-properties.js";
import noUnknownAtRules from "./rules/no-unknown-at-rules.js";
import noInvalidPropertyValues from "./rules/no-invalid-property-values.js";

//-----------------------------------------------------------------------------
// Plugin
//-----------------------------------------------------------------------------

const plugin = {
	meta: {
		name: "@eslint/css",
		version: "0.0.0", // x-release-please-version
	},
	languages: {
		css: new CSSLanguage(),
	},
	rules: {
		"no-empty-blocks": noEmptyBlocks,
		"no-duplicate-imports": noDuplicateImports,
		"no-unknown-at-rules": noUnknownAtRules,
		"no-unknown-properties": noUnknownProperties,
		"no-invalid-property-values": noInvalidPropertyValues,
	},
	configs: {},
};

Object.assign(plugin.configs, {
	recommended: {
		plugins: { css: plugin },
		rules: {
			"css/no-empty-blocks": "error",
			"css/no-duplicate-imports": "error",
			"css/no-unknown-at-rules": "error",
			"css/no-unknown-properties": "error",
			"css/no-invalid-property-values": "error",
		},
	},
});

export default plugin;
export { CSSLanguage, CSSSourceCode };
