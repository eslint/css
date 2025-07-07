# no-invalid-at-rules

Disallow invalid at-rules.

## Background

CSS contains a number of at-rules, each beginning with a `@`, that perform various operations. Some common at-rules include:

- `@import`
- `@media`
- `@font-face`
- `@keyframes`
- `@supports`
- `@namespace`
- `@page`

It's important to use a known at-rule because unknown at-rules cause the browser to ignore the entire block, including any rules contained within. For example:

```css
/* typo */
@impor "foo.css";
```

Here, the `@import` at-rule is incorrectly spelled as `@impor`, which means that it will be ignored.

Each at-rule also has a defined prelude (which may be empty) and potentially one or more descriptors. For example:

```css
@property --main-bg-color {
	syntax: "<color>";
	inherits: false;
	initial-value: #000000;
}
```

Here, `--main-bg-color` is the prelude for `@property` while `syntax`, `inherits`, and `initial-value` are descriptors. The `@property` at-rule requires a specific format for its prelude and only specific descriptors to be present. If any of these are incorrect, the browser ignores the at-rule.

## Rule Details

This rule warns when it finds a CSS at-rule that is unknown or invalid according to the CSS specification. As such, the rule warns for the following problems:

- An unknown at-rule
- An invalid prelude for a known at-rule
- An unknown descriptor for a known at-rule
- An invalid descriptor value for a known at-rule

The at-rule data is provided via the [CSSTree](https://github.com/csstree/csstree) project.

Examples of **incorrect** code:

```css
/* eslint css/no-invalid-at-rules: "error" */

@charse "UTF-8";

@importx url(foo.css);

@foobar {
	.my-style {
		color: red;
	}
}

@property main-bg-color {
	syntax: "<color>";
	inherits: false;
	initial-value: #000000;
}

@property --main-bg-color {
	syntax: red;
}
```

Note on `@charset`: Although it begins with an `@` symbol, it is not an at-rule. It is a specific byte sequence of the following form:

```css
@charset "<charset>";
```

where `charset` is a [`<string>`](https://developer.mozilla.org/en-US/docs/Web/CSS/string) denoting the character encoding to be used. It must be the name of a web-safe character encoding defined in the [IANA-registry](https://www.iana.org/assignments/character-sets/character-sets.xhtml), and must be double-quoted, following exactly one space character (U+0020), and immediately terminated with a semicolon.

Examples of **incorrect** code:

```css
@charset 'iso-8859-15'; /* Wrong quotes used */
@charset "UTF-8"; /* More than one space */
@charset UTF-8; /* The charset is a CSS <string> and requires double-quotes */
```

Examples of **correct** code:

```css
@charset "UTF-8";
```

## When Not to Use It

If you are purposely using at-rules that aren't part of the CSS specification, then you can safely disable this rule.

## Prior Art

- [`at-rule-no-unknown`](https://stylelint.io/user-guide/rules/at-rule-no-unknown)
