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
	},
	configs: {},
};

Object.assign(plugin.configs, {
	recommended: {
		plugins: { css: plugin },
		rules: {
			"css/no-empty-blocks": "error",
			"css/no-duplicate-imports": "error",
		},
	},
});

export default plugin;
export { CSSLanguage, CSSSourceCode };
