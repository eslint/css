/**
 * @fileoverview Extracts CSS features from the web-features package and writes
 * them to a file.
 * See example output from web-features: https://gist.github.com/nzakas/5bbc9eab6900d1e401208fa7bcf49500
 * @author Nicholas C. Zakas
 */

//------------------------------------------------------------------------------
// Imports
//------------------------------------------------------------------------------

import { features as webFeatures } from "web-features";
import prettier from "prettier";
import fs from "node:fs";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const BASELINE_HIGH = 10;
const BASELINE_LOW = 5;
const BASELINE_FALSE = 0;
const baselineIds = new Map([
	["high", BASELINE_HIGH],
	["low", BASELINE_LOW],
	[false, BASELINE_FALSE],
]);

/**
 * Flattens the compat features into an object where the key is the feature
 * name and the value is the baseline.
 * @param {Object} entry The entry to flatten.
 * @returns {Object} The flattened entry.
 */
function flattenCompatFeatures(entry) {
	if (!entry.compat_features) {
		return {};
	}

	return Object.fromEntries(
		entry.compat_features.map(feature => [feature, entry.status.baseline]),
	);
}

/**
 * Extracts CSS features from the raw data.
 * @param {Object} features The CSS features to extract.
 * @returns {Object} The extracted CSS features.
 */
function extractCSSFeatures(features) {
	/*
	 * The following regular expressions are used to match the keys in the
	 * features object. The regular expressions are used to extract the
	 * property name, value, at-rule, type, or selector from the key.
	 *
	 * For example, the key "css.properties.color" would match the
	 * cssPropertyPattern regular expression and the "color" property would be
	 * extracted.
	 *
	 * Note that these values cannot contain underscores as underscores are
	 * only used in feature names to provide descriptions rather than syntax.
	 * Example: css.properties.align-self.position_absolute_context
	 */
	const cssPropertyPattern = /^css\.properties\.(?<property>[a-zA-Z$\d-]+)$/u;
	const cssPropertyValuePattern =
		/^css\.properties\.(?<property>[a-zA-Z$\d-]+)\.(?<value>[a-zA-Z$\d-]+)$/u;
	const cssAtRulePattern = /^css\.at-rules\.(?<atRule>[a-zA-Z$\d-]+)$/u;
	const cssTypePattern = /^css\.types\.(?<type>[a-zA-Z$\d-]+)$/u;
	const cssSelectorPattern = /^css\.selectors\.(?<selector>[a-zA-Z$\d-]+)$/u;

	const properties = {};
	const propertyValues = {};
	const atRules = {};
	const types = {};
	const selectors = {};

	for (const [key, baseline] of Object.entries(features)) {
		let match;

		// property names
		if ((match = cssPropertyPattern.exec(key)) !== null) {
			properties[match.groups.property] = baselineIds.get(baseline);
			continue;
		}

		// property values
		if ((match = cssPropertyValuePattern.exec(key)) !== null) {
			if (!propertyValues[match.groups.property]) {
				propertyValues[match.groups.property] = {};
			}
			propertyValues[match.groups.property][match.groups.value] =
				baselineIds.get(baseline);
			continue;
		}

		// at-rules
		if ((match = cssAtRulePattern.exec(key)) !== null) {
			atRules[match.groups.atRule] = baselineIds.get(baseline);
			continue;
		}

		// types
		if ((match = cssTypePattern.exec(key)) !== null) {
			types[match.groups.type] = baselineIds.get(baseline);
			continue;
		}

		// selectors
		if ((match = cssSelectorPattern.exec(key)) !== null) {
			selectors[match.groups.selector] = baselineIds.get(baseline);
			continue;
		}
	}

	return {
		properties,
		propertyValues,
		atRules,
		types,
		selectors,
	};
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

// create one object with all features then filter just on the css ones
const allFeatures = Object.values(webFeatures).reduce(
	(acc, entry) => Object.assign(acc, flattenCompatFeatures(entry)),
	{},
);
const cssFeatures = extractCSSFeatures(
	Object.fromEntries(
		Object.entries(allFeatures).filter(([key]) => key.startsWith("css.")),
	),
);
const featuresPath = "./src/data/baseline-data.js";

// export each group separately as a Set, such as highProperties, lowProperties, etc.
const code = `/**
 * @fileoverview CSS features extracted from the web-features package.
 * @author tools/generate-baseline.js
 * 
 * THIS FILE IS AUTOGENERATED. DO NOT MODIFY DIRECTLY.
 */

export const BASELINE_HIGH = ${BASELINE_HIGH};
export const BASELINE_LOW = ${BASELINE_LOW};
export const BASELINE_FALSE = ${BASELINE_FALSE};

export const properties = new Map(${JSON.stringify(Object.entries(cssFeatures.properties), null, "\t")});
export const atRules = new Map(${JSON.stringify(Object.entries(cssFeatures.atRules), null, "\t")});
export const types = new Map(${JSON.stringify(Object.entries(cssFeatures.types), null, "\t")});
export const selectors = new Map(${JSON.stringify(Object.entries(cssFeatures.selectors), null, "\t")});
export const propertyValues = new Map([${Object.entries(
	cssFeatures.propertyValues,
).map(
	([key, value]) =>
		`["${key}", new Map(${JSON.stringify(Object.entries(value), null, "\t")})]`,
)}]);
`;

fs.writeFileSync(
	featuresPath,
	await prettier.format(code, { filepath: featuresPath }),
);