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
// Constants
//------------------------------------------------------------------------------

/*
 * Properties that aren't considered baseline but have wide support.
 * https://github.com/web-platform-dx/web-features/issues/1038#issuecomment-2627370691
 */

const WIDE_SUPPORT_PROPERTIES = new Set(["cursor"]);

/**
 * Mapping from grouped BCD keys to individual CSS unit names.
 * These keys use underscores to describe a group of related units.
 * https://github.com/mdn/browser-compat-data/blob/main/css/types/length.json
 */
const groupedUnitMappings = {
	viewportPercentageUnitsSmall: [
		"svb",
		"svh",
		"svi",
		"svmax",
		"svmin",
		"svw",
	],
	viewportPercentageUnitsLarge: [
		"lvb",
		"lvh",
		"lvi",
		"lvmax",
		"lvmin",
		"lvw",
	],
	viewportPercentageUnitsDynamic: [
		"dvb",
		"dvh",
		"dvi",
		"dvmax",
		"dvmin",
		"dvw",
	],
	containerQueryLengthUnits: ["cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax"],
};

/*
 * Some bare `css.types.<name>` compat keys refer to CSS data types
 * instead of functions. For example, `css.types.image` refers to `<image>`,
 * not `image()`.
 */
const UNGROUPED_NON_FUNCTION_TYPES = new Set(["color", "image"]);

const BASELINE_HIGH = 10;
const BASELINE_LOW = 5;
const BASELINE_FALSE = 0;
const baselineIds = new Map([
	["high", BASELINE_HIGH],
	["low", BASELINE_LOW],
	[false, BASELINE_FALSE],
]);

/*
 * The following regular expressions are used to match the keys in the
 * features object. The regular expressions are used to extract the
 * property name, value, at-rule, type, or selector from the key.
 *
 * For example, the key "css.properties.color" would match the
 * property regular expression and the "color" property would be
 * extracted.
 *
 * Note that these values cannot contain underscores as underscores are
 * only used in feature names to provide descriptions rather than syntax.
 * Example: css.properties.align-self.position_absolute_context
 */
const PATTERNS = {
	property: /^css\.properties\.(?<property>[a-zA-Z$\d-]+)$/u,
	propertyValue:
		/^css\.properties\.(?<property>[a-zA-Z$\d-]+)\.(?<value>[a-zA-Z$\d-]+)$/u,
	atRule: /^css\.at-rules\.(?<atRule>[a-zA-Z$\d-]+)$/u,
	mediaCondition: /^css\.at-rules\.media\.(?<condition>[a-zA-Z$\d-]+)$/u,
	selector: /^css\.selectors\.(?<selector>[a-zA-Z$\d-]+)$/u,
	type: /^css\.types\.(?:(?<group>[a-zA-Z\d-]+)\.)?(?<type>[a-zA-Z\d-]+)$/u,
	unit: /^css\.types\.length\.(?<unit>[\w-]+)$/u,
	functionName: /^(?<name>[a-zA-Z\d-]+)\(\)$/u,
};

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

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
 * Determines if a name matches a known CSS function in MDN data.
 * @param {string} functionName The function name without trailing parentheses.
 * @returns {boolean} True if the function exists in MDN data.
 */
function isKnownCSSFunction(functionName) {
	return `${functionName}()` in mdnData.css.functions;
}

/**
 * Determines if a compat-derived CSS type key actually represents a function.
 * @param {string|undefined} group The optional CSS type group.
 * @param {string} typeName The parsed type name to check (e.g., "color" or "calc").
 * @returns {boolean} True if the compat key represents a CSS function.
 */
function isCompatTypeAFunction(group, typeName) {
	if (!group && UNGROUPED_NON_FUNCTION_TYPES.has(typeName)) {
		return false;
	}

	return isKnownCSSFunction(typeName);
}

/**
 * Extracts CSS features from the raw data.
 * @param {Object} features The CSS features to extract.
 * @returns {Object} The extracted CSS features.
 */
function extractCSSFeatures(features) {
	const output = {
		properties: {},
		propertyValues: {},
		atRules: {},
		mediaConditions: {},
		selectors: {},
		functions: {},
		units: {},
	};

	for (const feature of Object.values(features)) {
		// Check if the feature name itself represents a function
		const nameMatch = PATTERNS.functionName.exec(feature.name);
		if (nameMatch && isKnownCSSFunction(nameMatch.groups.name)) {
			output.functions[nameMatch.groups.name] = mapFeatureStatus(
				feature.status,
			);
		}

		if (!feature.compat_features) {
			continue;
		}

		for (const key of feature.compat_features) {
			if (!key.startsWith("css.")) {
				continue;
			}

			let match;

			// Handle CSS units before the by_compat_key check, since some unit
			// features (e.g., viewport-unit-variants) don't have by_compat_key.
			if ((match = PATTERNS.unit.exec(key))) {
				const unitStatus =
					feature.status.by_compat_key?.[key] ?? feature.status;

				if (unitStatus.baseline === undefined) {
					continue;
				}

				const unitKey = match.groups.unit;
				const encoded = mapFeatureStatus(unitStatus);

				// Grouped keys (with underscores) map to multiple unit names
				// Convert BCD underscore keys to camelCase for lookup
				const camelKey = unitKey.replace(/_([a-z])/gu, (_, c) =>
					c.toUpperCase(),
				);
				if (groupedUnitMappings[camelKey]) {
					for (const unit of groupedUnitMappings[camelKey]) {
						output.units[unit] = encoded;
					}
				} else {
					// Simple unit names like "vb", "vi"
					output.units[unitKey] = encoded;
				}

				continue;
			}

			const status = feature.status.by_compat_key[key];

			// properties
			if ((match = PATTERNS.property.exec(key))) {
				if (!WIDE_SUPPORT_PROPERTIES.has(match.groups.property)) {
					output.properties[match.groups.property] =
						mapFeatureStatus(status);
				}
			}
			// property values
			else if ((match = PATTERNS.propertyValue.exec(key))) {
				if (!WIDE_SUPPORT_PROPERTIES.has(match.groups.property)) {
					output.propertyValues[match.groups.property] ??= {};
					output.propertyValues[match.groups.property][
						match.groups.value
					] = mapFeatureStatus(status);
				}
			}
			// at-rules
			else if ((match = PATTERNS.atRule.exec(key))) {
				output.atRules[match.groups.atRule] = mapFeatureStatus(status);
			}
			// media conditions (@media features)
			else if ((match = PATTERNS.mediaCondition.exec(key))) {
				output.mediaConditions[match.groups.condition] =
					mapFeatureStatus(status);
			}
			// functions
			else if ((match = PATTERNS.type.exec(key))) {
				const { group, type } = match.groups;
				if (isCompatTypeAFunction(group, type)) {
					output.functions[type] = mapFeatureStatus(status);
				}
			}
			// selectors
			else if ((match = PATTERNS.selector.exec(key))) {
				output.selectors[match.groups.selector] =
					mapFeatureStatus(status);
			}
		}
	}

	return output;
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

const cssFeatures = extractCSSFeatures(webFeatures);
const featuresPath = "./src/data/baseline-data.js";

const code = `/**
 * @fileoverview CSS features extracted from the web-features package.
 * @author tools/generate-baseline.js
 *
 * THIS FILE IS AUTOGENERATED. DO NOT MODIFY DIRECTLY.
 */

export const BASELINE_HIGH = ${BASELINE_HIGH};
export const BASELINE_LOW = ${BASELINE_LOW};

export const properties = new Map(${JSON.stringify(Object.entries(cssFeatures.properties), null, "\t")});
export const atRules = new Map(${JSON.stringify(Object.entries(cssFeatures.atRules), null, "\t")});
export const mediaConditions = new Map(${JSON.stringify(Object.entries(cssFeatures.mediaConditions), null, "\t")});
export const functions = new Map(${JSON.stringify(Object.entries(cssFeatures.functions), null, "\t")});
export const units = new Map(${JSON.stringify(Object.entries(cssFeatures.units), null, "\t")});
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
