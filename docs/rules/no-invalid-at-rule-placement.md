# no-invalid-at-rule-placement

Disallow invalid placement of at-rules.

## Background

At-rules are CSS statements that instruct CSS how to behave. Some at-rules have strict placement requirements that must be followed for the stylesheet to work correctly. For example:

- The `@charset` rule must be placed at the very beginning of a stylesheet, before any other rules, comments, or whitespace.
- The `@import` rule must be placed at the beginning of a stylesheet, before any other at-rules (except `@charset` and `@layer` statements) and style rules.

If these rules are placed incorrectly, browsers will ignore them, resulting in potential encoding issues or missing imported styles.

## Rule Details

This rule warns when it finds:

1. A `@charset` rule that is not the first rule in the stylesheet
2. An `@import` rule that appears after any other at-rules or style rules (except `@charset` and `@layer` statements)

Examples of **incorrect** code:

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @charset not at the beginning */
@import "foo.css";
@charset "utf-8";
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @import after style rules */
a {
	color: red;
}
@import "foo.css";
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @import after @layer block */
@layer base {
}
@import "bar.css";
```

Examples of **correct** code:

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @charset at the beginning */
@charset "utf-8";
@import "foo.css";
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @import before style rules */
@import "foo.css";
a {
	color: red;
}
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @import after @layer statement */
@layer base;
@import "baz.css";
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* Multiple @import rules together */
@import "foo.css";
@import "bar.css";
a {
	color: red;
}
```

## When Not to Use It

You can disable this rule if your stylesheets don't use `@charset` or `@import` rules, or if you're not concerned about the impact of incorrect placement on encoding and style loading.

## Prior Art

- [`no-invalid-position-at-import-rule`](https://stylelint.io/user-guide/rules/no-invalid-position-at-import-rule/)
