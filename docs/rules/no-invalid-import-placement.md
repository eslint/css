# no-invalid-import-placement

Disallow invalid placement of `@import` rules.

## Background

The `@import` rule must be placed at the beginning of a stylesheet, before any other at-rules (except `@charset` and `@layer`) and style rules. If placed elsewhere, browsers will ignore the `@import` rule, resulting in the imported styles being missing from the page.

## Rule Details

This rule warns when it finds an `@import` rule that appears after any other at-rules or style rules in a stylesheet (ignoring `@charset` and `@layer` rules).

Examples of **incorrect** code:

```css
/* eslint css/no-invalid-import-placement: "error" */

/* @import after style rules */
a {
	color: red;
}
@import "foo.css";
```

```css
/* eslint css/no-invalid-import-placement: "error" */

/* @import after at-rules */
@media screen {
}
@import "bar.css";
```

Examples of **correct** code:

```css
/* eslint css/no-invalid-import-placement: "error" */

/* @import at the beginning */
@import "foo.css";
a {
	color: red;
}
```

```css
/* eslint css/no-invalid-import-placement: "error" */

/* @import after @charset */
@charset "utf-8";
@import "bar.css";
a {
	color: red;
}
```

```css
/* eslint css/no-invalid-import-placement: "error" */

/* @import after @layer */
@layer base;
@import "baz.css";
a {
	color: red;
}
```

```css
/* eslint css/no-invalid-import-placement: "error" */

/* Multiple @import rules together */
@import "foo.css";
@import "bar.css";
a {
	color: red;
}
```

## When Not to Use It

You can disable this rule if your stylesheets don't use `@import` or if you're not concerned about the impact of incorrect placement on style loading.

## Prior Art

- [`no-invalid-position-at-import-rule`](https://stylelint.io/user-guide/rules/no-invalid-position-at-import-rule/)
