# no-invalid-import-placement

Disallow invalid placement of `@import` rules.

## Background

The `@import` rule must be placed at the beginning of a stylesheet, before any other at-rules (except `@charset` and `@layer`) and style rules. If placed elsewhere, browsers will ignore the `@import` rule, causing the imported styles to be missing from the page.

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

/* @import after @charset */
@charset "utf-8";
@import "bar.css";
a {
	color: red;
}

/* @import after @layer */
@layer base;
@import "baz.css";
a {
	color: red;
}

/* Multiple @import rules together */
@import "foo.css";
@import "bar.css";
a {
	color: red;
}
```

## When Not to Use It

If you don't care about the placement of `@import` rules in your stylesheets, you can safely disable this rule.

## Prior Art

- [`no-invalid-position-at-import-rule`](https://stylelint.io/user-guide/rules/no-invalid-position-at-import-rule/)
