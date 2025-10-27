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
import mdnData from "mdn-data";
import prettier from "prettier";
import fs from "node:fs";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/*
 * Properties that aren't considered baseline but have wide support.
 * https://github.com/web-platform-dx/web-features/issues/1038#issuecomment-2627370691
 */

const WIDE_SUPPORT_PROPERTIES = new Set(["cursor"]);

const BASELINE_HIGH = 10;
const BASELINE_LOW = 5;
const BASELINE_FALSE = 0;
const baselineIds = new Map([
	["high", BASELINE_HIGH],
	["low", BASELINE_LOW],
	[false, BASELINE_FALSE],
]);

/**
 * Encodes the baseline status and year fields into a single string.
 * @param {string} status The feature's baseline status.
 * @param {number} year The feature's baseline year.
 * @returns {string} The encoded baseline status and year.
 */
function encodeBaselineStatus(status, year) {
	return `${status}:${year || ""}`;
}

/**
 * Maps the raw feature status object to a baseline status ID and year.
 * @param {Object} status The raw feature status object.
 * @returns {Object} An object containing the baseline status and year.
 */
function mapFeatureStatus(status) {
	let baselineYear;
	// extract the year part YYYY from the date formatted YYYY-MM-DD
	if (status.baseline_low_date?.startsWith("≤")) {
		baselineYear = Number(status.baseline_low_date.slice(1, 5));
	} else {
		baselineYear = Number(status.baseline_low_date?.slice(0, 4));
	}
	return encodeBaselineStatus(baselineIds.get(status.baseline), baselineYear);
}

/**
 * Flattens the compat features into an object where the key is the feature
 * name and the value is the baseline.
 * @param {[string, {compat_features?: string[]}]} featureEntry The entry to flatten.
 * @returns {Object} The flattened entry.
 */
function flattenCompatFeatures([featureId, entry]) {
	if (!entry.compat_features) {
		return {};
	}

	return Object.fromEntries(
		entry.compat_features.map(feature => [feature, featureId]),
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
	const cssMediaConditionPattern =
		/^css\.at-rules\.media\.(?<condition>[a-zA-Z$\d-]+)$/u;
	const cssTypePattern = /^css\.types\.(?:.*?\.)?(?<type>[a-zA-Z\d-]+)$/u;
	const cssSelectorPattern = /^css\.selectors\.(?<selector>[a-zA-Z$\d-]+)$/u;

	const properties = {};
	const propertyValues = {};
	const atRules = {};
	const mediaConditions = {};
	const functions = {};
	const selectors = {};

	for (const [key, featureId] of Object.entries(features)) {
		const feature = webFeatures[featureId];
		const status = feature.status.by_compat_key[key];
		let match;

		// property names
		if (
			(match = cssPropertyPattern.exec(key)) !== null &&
			!WIDE_SUPPORT_PROPERTIES.has(match.groups.property)
		) {
			properties[match.groups.property] = mapFeatureStatus(status);
			continue;
		}

		// property values
		if ((match = cssPropertyValuePattern.exec(key)) !== null) {
			// don't include values for these properties
			if (WIDE_SUPPORT_PROPERTIES.has(match.groups.property)) {
				continue;
			}

			if (!propertyValues[match.groups.property]) {
				propertyValues[match.groups.property] = {};
			}
			propertyValues[match.groups.property][match.groups.value] =
				mapFeatureStatus(status);
			continue;
		}

		// at-rules
		if ((match = cssAtRulePattern.exec(key)) !== null) {
			atRules[match.groups.atRule] = mapFeatureStatus(status);
			continue;
		}

		// Media conditions (@media features)
		if ((match = cssMediaConditionPattern.exec(key)) !== null) {
			mediaConditions[match.groups.condition] = mapFeatureStatus(status);
			continue;
		}

		// functions
		if ((match = cssTypePattern.exec(key)) !== null) {
			const type = match.groups.type;
			if (!(`${type}()` in mdnData.css.functions)) {
				continue;
			}
			functions[type] = mapFeatureStatus(status);
			continue;
		}

		// selectors
		if ((match = cssSelectorPattern.exec(key)) !== null) {
			selectors[match.groups.selector] = mapFeatureStatus(status);
			continue;
		}
	}

	return {
		properties,
		propertyValues,
		atRules,
		mediaConditions,
		functions,
		selectors,
	};
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

// create one object with all features then filter just on the css ones
const allFeatures = Object.entries(webFeatures).reduce(
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
export const mediaConditions = new Map(${JSON.stringify(Object.entries(cssFeatures.mediaConditions), null, "\t")});
export const functions = new Map(${JSON.stringify(Object.entries(cssFeatures.functions), null, "\t")});
export const selectors = new Map(${JSON.stringify(Object.entries(cssFeatures.selectors), null, "\t")});
export const propertyValues = new Map([${Object.entries(
	cssFeatures.propertyValues,
).map(
	([key, value]) =>
		`["${key}", new Map(${JSON.stringify(Object.entries(value), null, "\t")})]`,
)}]);
`;

// load prettier config
const prettierConfig = await prettier.resolveConfig(featuresPath);

fs.writeFileSync(
	featuresPath,
	await prettier.format(code, { filepath: featuresPath, ...prettierConfig }),
);
