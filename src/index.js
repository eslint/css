/**
 * @fileoverview CSS plugin.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { CSSLanguage } from "./languages/css-language.js";
import { CSSSourceCode } from "./languages/css-source-code.js";
import recommendedRules from "./build/recommended-config.js";
import rules from "./build/rules.js";

//-----------------------------------------------------------------------------
// Plugin
//-----------------------------------------------------------------------------

const plugin = {
	meta: {
		name: "@eslint/css",
		version: "1.2.0", // x-release-please-version
	},
	languages: {
		css: new CSSLanguage(),
	},
	rules,
	configs: {
		recommended: {
			name: "@eslint/css/recommended",
			plugins: {},
			rules: recommendedRules,
		},
	},
};

Object.assign(plugin.configs.recommended.plugins, { css: plugin });

export default plugin;
export { CSSSourceCode };
export * from "./languages/css-language.js";
export * from "./types.js";
