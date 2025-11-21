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
		version: "0.15.0", // x-release-please-version
	},
	languages: {
		css: new CSSLanguage(),
	},
	rules,
	configs: {
		recommended: {
			plugins: {},
			rules: recommendedRules,
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
