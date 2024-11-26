# no-duplicate-imports

Disallow duplicate `@import` rules.

## Background

CSS files can import rules from other CSS files using the `@import` rule and specifying a URL from which to load. In a file with many `@import` rules it can be difficult to see if you've accidentally imported the same URL twice, for example:

```css
@import url(a.css);
@import "b.css";
@import url("c.css");
@import "a.css";
```

There is no reason to import the same URL twice, so this is a mistake.

## Rule Details

This rule warns when it finds an `@import` rule that imports the same URL as a previous `@import` rule. This includes all of the URL forms (`"a.css"`, `url("a.css")`, and `url(a.css)`).

Examples of incorrect code:

```css
@import url(a.css);
@import "b.css";
@import url("c.css");

/* duplicates */
@import "a.css";
@import url(b.css);
@import "c.css";
```

## When Not to Use It

If you aren't concerned with duplicate `@import` rules, you can safely disable this rule.

## Prior Art

- [`no-duplicate-at-import-rules`](https://stylelint.io/user-guide/rules/no-duplicate-at-import-rules)
