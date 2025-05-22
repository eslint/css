# relative-font-units

Enforce the use of relative units for font size.

## Background

The `font-size` property in CSS defines the size of the text. It can be set using:

1. Keywords (e.g., `small`, `medium`, `large`).
1. Length units (e.g., `px`, `em`, `rem`, `pt`).
1. Percentages (`%`, relative to the parent element's font size).

Generally, relative units such as `rem` or `em` are preferred over absolute ones like `px`, `pt` because of the following reasons:

- **Responsive Design** - Relative units adapt better to various screen widths and pixel densities (e.g., mobile vs. desktop).
- **Accessibility** - Relative units allow text to scale when users adjust browser settings or zoom levels.
- **Consistency and Scalability** - Using relative units allow for consistent scaling across a whole site.
- **Maintainability and Reusability** - Relative units allow components or utility classes to work well in different contexts.

## Rule Details

This rule enforces the use of relative units for font size.

## Options

This rule accepts an option which is an object with the following property:

- `allowUnits` (default: `["rem"]`) - Specify an array of relative units that are allowed to be used. You can use the following units:

    - **%**: Represents the "percentage" of the parent element’s font size, allowing the text to scale relative to its container.
    - **cap**: Represents the "cap height" (nominal height of capital letters) of the element's font.
    - **ch**: Represents the width or advance measure of the "0" glyph in the element's font.
    - **em**: Represents the calculated font-size of the element.
    - **ex**: Represents the x-height of the element's font.
    - **ic**: Equal to the advance measure of the "水" glyph (CJK water ideograph) in the font.
    - **lh**: Equal to the computed line-height of the element.
    - **rcap**: Equal to the "cap height" of the root element's font.
    - **rch**: Equal to the width or advance measure of the "0" glyph in the root element's font.
    - **rem**: Represents the font-size of the root element.
    - **rex**: Represents the x-height of the root element's font.
    - **ric**: Equal to the ic unit on the root element's font.
    - **rlh**: Equal to the lh unit on the root element's font.

Example of **incorrect** code for default `{ allowUnits: ["rem"] }` option:

```css
/* eslint css/relative-font-units: ["error",  { allowUnits: ["rem"] }] */

a {
	font-size: 10px;
}

b {
	font-size: 2em;
}

c {
	font-size: small;
}
```

Example of **correct** code for default `{ allowUnits: ["rem"] }` option:

```css
/* eslint css/relative-font-units: ["error", { allowUnits: ["rem"] }] */

a {
	font-size: 2rem;
}

b {
	font-size: 1rem;
	width: 20px;
}

c {
	font-size: var(--foo);
}

d {
	font-size: calc(2rem + 2px);
}
```

Font size can also be specified in `font` property:

Example of **correct** code for `{ allowUnits: ["em", "%"] }` option:

```css
/* eslint css/relative-font-units: ["error", { allowUnits: ["em", "%"] }] */

a {
	font-size: 2em;
}

b {
	font:
		20% Arial,
		sans-serif;
}

c {
	font: Arial var(--foo);
}
```

## When Not to Use It

If your project does not prioritize the use of relative font-size units—such as in cases requiring absolute sizing for print styles, pixel-perfect UI components, or embedded widgets—you may safely disable this rule without impacting your intended design precision.

## Further Reading

- [`Surprising truth about Pixels and Accessibility`](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/)
