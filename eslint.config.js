/**
 * @fileoverview ESLint configuration file.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import eslintConfigESLint from "eslint-config-eslint";
import json from "@eslint/json";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

const eslintPluginJSDoc = eslintConfigESLint.find(
	config => config.plugins?.jsdoc,
).plugins.jsdoc;

//-----------------------------------------------------------------------------
// Configuration
//-----------------------------------------------------------------------------

export default [
	{
		ignores: ["**/tests/fixtures/", "**/dist/"],
	},

	...eslintConfigESLint.map(config => ({
		files: ["**/*.js"],
		...config,
	})),
	{
		files: ["**/*.json"],
		ignores: ["**/package-lock.json"],
		language: "json/json",
		...json.configs.recommended,
	},
	{
		files: ["**/*.js"],
		rules: {
			// disable rules we don't want to use from eslint-config-eslint
			"no-undefined": "off",
			"class-methods-use-this": "off",

			// TODO: re-enable eslint-plugin-jsdoc rules
			...Object.fromEntries(
				Object.keys(eslintPluginJSDoc.rules).map(name => [
					`jsdoc/${name}`,
					"off",
				]),
			),
		},
	},
	{
		files: ["**/tests/**"],
		languageOptions: {
			globals: {
				describe: "readonly",
				xdescribe: "readonly",
				it: "readonly",
				xit: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				before: "readonly",
				after: "readonly",
			},
		},
	},
];
