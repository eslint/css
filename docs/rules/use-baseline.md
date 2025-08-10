# use-baseline

Enforce the use of baseline features

## Background

[Baseline](https://web-platform-dx.github.io/web-features/) is an effort by the [W3C WebDX Community Group](https://www.w3.org/community/webdx/) to document which features of the web platform are available in a [set of core browsers](https://web-platform-dx.github.io/web-features/#:~:text=using%20the%20following-,core%20browser%20set,-%3A) (currently composed of Chrome, Chrome for Android, Edge, Firefox, Firefox for Android, Safari, and Safari for iOS). The Baseline data allows developers to make quicker decisions about the technologies they wish to use on their websites.

Baseline tracks features that cover the entire web platform, including features that are about CSS properties, values, or selectors. This rule uses the Baseline data from these CSS-related features.

Features tracked by Baseline can be in either of these three stages:

- **Widely available** features are supported by all the core browsers for at least 30 months.
- **Newly available** features are supported by all the core browsers for less than 30 months.
- **Limited availability** features are not yet supported by all the core browsers.

While using only Baseline widely available features can help ensure the greatest interoperability across browsers, note that:

- Testing your site is still required, especially if your audience uses browsers other than the Baseline core browser set.
- Testing how accessible your site is with assistive technologies is still required. Baseline does not track how assistive technologies support web platform features.
- You might still want to use non-widely available features, for example as part of a progressive enhancement strategy, using the `@supports` rule, or by defining fallbacks, or because of the browsers or devices your audience uses.

## Rule Details

This rule warns when it finds any of the following:

- A CSS property that isn't widely available or otherwise isn't enclosed in a `@supports` block.
- An at-rule that isn't widely available.
- A media condition inside `@media` that isn't widely available.
- A CSS property value that isn't widely available or otherwise isn't enclosed in a `@supports` block (currently limited to identifiers only).
- A CSS property function that isn't widely available.
- A CSS pseudo-element or pseudo-class selector that isn't widely available.

The data is provided via the [web-features](https://npmjs.com/package/web-features) package.

Examples of **incorrect** code:

```css
/* eslint css/use-baseline: "error" */

/* invalid - accent-color is not widely available */
a {
	accent-color: red;
}

/* invalid - abs is not widely available */
.box {
	width: abs(20% - 100px);
}

/* invalid - :has() is not widely available */
h1:has(+ h2) {
	margin: 0 0 0.25rem 0;
}

/* invalid - device-posture is not widely available */
@media (device-posture: folded) {
	a {
		color: red;
	}
}

/* invalid - property value doesn't match @supports indicator */
@supports (accent-color: auto) {
	a {
		accent-color: abs(20% - 10px);
	}
}

/* invalid - @supports says that this property isn't available */
@supports not (accent-color: auto) {
	a {
		accent-color: auto;
	}
}
```

Examples of **correct** code:

```css
/* eslint css/use-baseline: "error" */

/* valid - @supports indicates you're choosing a limited availability selector */
@supports selector(:has()) {
	h1:has(+ h2) {
		margin: 0 0 0.25rem 0;
	}
}

/* valid - @supports indicates you're choosing a limited availability property */
@supports (accent-color: auto) {
	a {
		accent-color: auto;
	}
}
```

**Important:** While the `cursor` property is not considered baseline, it has wide support and will likely be considered baseline once the WebDX Community Group adds [an editorial step](https://github.com/web-platform-dx/web-features/issues/1038). In the meantime, this rule does not warn when `cursor` is used.

### Options

This rule accepts an options object with the following properties:

- `available` (default: `"widely"`)
    - change to `"newly"` to allow features that are at the Baseline newly available stage: features that have been supported on all core browsers for less than 30 months
    - set to a numeric baseline year, such as `2023`, to allow features that became Baseline newly available that year, or earlier
- `allowAtRules` (default: `[]`) - Specify an array of at-rules that are allowed to be used.
- `allowProperties` (default: `[]`) - Specify an array of properties that are allowed to be used.
- `allowSelectors` (default: `[]`) - Specify an array of selectors that are allowed to be used.

#### `allowAtRules`

Examples of **correct** code with `{ allowAtRules: ["container"] }`:

```css
/* eslint css/use-baseline: ["error", { allowAtRules: ["container"] }] */

@container (width > 400px) {
	h2 {
		font-size: 1.5em;
	}
}
```

#### `allowProperties`

Examples of **correct** code with `{ allowProperties: ["user-select"] }`:

```css
/* eslint css/use-baseline: ["error", { allowProperties: ["user-select"] }] */

.unselectable {
	user-select: none;
}
```

#### `allowSelectors`

When you want to allow the [& nesting selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector), you can use `"nesting"`.

Examples of **correct** code with `{ allowSelectors: ["nesting"] }`:

```css
/* eslint css/use-baseline: ["error", { allowSelectors: ["nesting"] }] */

.parent {
	&:hover {
		background-color: blue;
	}
}
```

Examples of **correct** code with `{ allowSelectors: ["has"] }`:

```css
/* eslint css/use-baseline: ["error", { allowSelectors: ["has"] }] */

h1:has(+ h2) {
	margin: 0 0 0.25rem 0;
}
```

## When Not to Use It

If your web application doesn't target all Baseline browsers then you can safely disable this rule.

## Further Reading

- [How do features become part of Baseline?](https://web-platform-dx.github.io/web-features/#how-do-features-become-part-of-baseline%3F)
