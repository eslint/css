# no-invalid-at-rule-placement

Disallow invalid placement of at-rules.

## Background

At-rules are CSS statements that instruct CSS how to behave. Some at-rules have strict placement requirements that must be followed for the stylesheet to work correctly. For example:

- The `@charset` rule must be placed at the very beginning of a stylesheet, before any other rules, comments, or whitespace.
- The `@import` rule must be placed at the beginning of a stylesheet, before any other at-rules (except `@charset` and `@layer` statements) and style rules.
- The `@namespace` rule must be placed after `@charset` and `@import` and before any other at-rules and style rules.

If these rules are placed incorrectly, browsers will ignore them, resulting in potential encoding issues, missing imported styles, or incorrect namespace application.

## Rule Details

This rule warns when it finds:

1. A `@charset` rule that is not the first rule in the stylesheet
2. An `@import` rule that appears after any other at-rules or style rules (except `@charset` and `@layer` statements)
3. A `@namespace` rule that appears before `@charset` or `@import` or after any other at-rules or style rules

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

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @namespace after style rules */
a {
	color: red;
}
@namespace svg url("http://www.w3.org/2000/svg");
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @namespace after @media */
@media (min-width: 600px) {
}
@namespace svg url("http://www.w3.org/2000/svg");
```

Examples of **correct** code:

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

@charset "utf-8"; /* @charset at the beginning */
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

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @namespace before style rules */
@namespace svg url("http://www.w3.org/2000/svg");
a {
	color: red;
}
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @namespace before @media */
@namespace svg url("http://www.w3.org/2000/svg");
@media (min-width: 600px) {
}
```

```css
/* eslint css/no-invalid-at-rule-placement: "error" */

/* @charset, @import, and @namespace in correct order */
@charset "utf-8";
@import "foo.css";
@namespace svg url("http://www.w3.org/2000/svg");
a {
	color: red;
}
```

## When Not to Use It

You can disable this rule if your stylesheets don't use `@charset`, `@import`, or `@namespace` rules, or if you're not concerned about the impact of incorrect placement on encoding, namespace usage, or style loading.

## Prior Art

- [`no-invalid-position-at-import-rule`](https://stylelint.io/user-guide/rules/no-invalid-position-at-import-rule/)

## Further Reading

- [@charset - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@charset)
- [@import - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@import)
- [@namespace - CSS | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@namespace)
