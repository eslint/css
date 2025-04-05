import css from "@eslint/css";
import type { CSSLanguageOptions } from "@eslint/css";
// import { ESLint } from "eslint";

// json satisfies ESLint.Plugin;
css.meta.name satisfies string;
css.meta.version satisfies string;

// Check that these languages are defined:
css.languages.css satisfies object;

// Check that `plugins` in the recommended config is defined:
css.configs.recommended.plugins satisfies object;

{
	type RecommendedRuleName = keyof typeof css.configs.recommended.rules;
	type RuleName = `css/${keyof typeof css.rules}`;
	type AssertAllNamesIn<T1 extends T2, T2> = never;

	// Check that all recommended rule names match the names of existing rules in this plugin.
	null as AssertAllNamesIn<RecommendedRuleName, RuleName>;
}
