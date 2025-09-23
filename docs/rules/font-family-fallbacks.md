# font-family-fallbacks

Enforce the use of fallback fonts and a generic font last.

## Background

The `font-family` property in CSS is used to specify which fonts should be used to display text. One can specify one or a list of fonts in `font-family`.

The browser checks if the first font is available to the user's system, if the first font is not available, it tries the next font in the list. This process continues until a font is found. If none of the specified fonts are available, the browser uses the generic font family (like `serif`, `sans-serif`, etc.) at the end of the list.

It is a best practice to use a fallback font and a generic font last in the `font-family` list to ensure that text is always displayed in readable and consistent way, even if the preferred fonts are not available on the user's system or if the browser doesn't support the preferred font.

## Rule Details

This rule enforces the use of fallback fonts and a generic font last in `font-family` and `font` property.

Example of **incorrect** code:

```css
/* eslint css/font-family-fallbacks: "error" */

:root {
	--my-font: "Open Sans";
}

a {
	font-family: Arial;
}

b {
	font-family: Verdana, Arial, Helvetica;
}

.foo {
	font-family: var(--my-font);
}
```

Example of **correct** code:

```css
/* eslint css/font-family-fallbacks: "error" */

:root {
	--my-font: "Open Sans", Arial, sans-serif;
}

a {
	font-family: Verdana, Arial, Helvetica, sans-serif;
}

b {
	font-family: serif;
}

.foo {
	font-family: var(--my-font);
}
```

Fonts can also be specified using the `font` property, which acts as a shorthand for several font-related properties, including `font-family`. You must specify both the `font-size` and `font-family` when using `font` property.

Example of **incorrect** code:

```css
/* eslint css/font-family-fallbacks: "error" */

:root {
	--my-font: "Times New Roman";
}

a {
	font: 16px Arial;
}

b {
	font:
		italic bold 2em "Open Sans",
		Helvetica;
}

.foo {
	font: italic bold 2em var(--my-font);
}
```

Example of **correct** code:

```css
/* eslint css/font-family-fallbacks: "error" */

:root {
	--my-font: "Times New Roman", Arial, serif;
	--font: "Open Sans", Helvetica;
}

a {
	font:
		16px Arial,
		sans-serif;
}

b {
	font:
		italic bold 2em "Open Sans",
		Helvetica,
		sans-serif;
}

.foo {
	font: normal 2em var(--my-font);
}

.bar {
	font:
		1em var(--font),
		monospace;
}
```

## When Not to Use It

If you are confident that the font will always load and render as expected, then you can safely disable this rule.

## Prior Art

- [`font-family-no-missing-generic-family-keyword`](https://stylelint.io/user-guide/rules/font-family-no-missing-generic-family-keyword/)
