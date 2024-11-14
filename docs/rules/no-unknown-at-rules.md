# no-unknown-at-rules

Disallow unknown at-rules.

## Background

CSS contains a number of at-rules, each beginning with a `@`, that perform various operations. Some common at-rules include:

-   `@import`
-   `@media`
-   `@font-face`
-   `@keyframes`
-   `@supports`
-   `@namespace`
-   `@page`
-   `@charset`

It's important to use a known at-rule because unknown at-rules cause the browser to ignore the entire block, including any rules contained within. For example:

```css
/* typo */
@charse "UTF-8";
```

Here, the `@supports` at-rule is incorrectly spelled as `@support`, which means that the rule for `.grid-container` will be ignored even if the browser supports `display: grid`.

## Rule Details

This rule warns when it finds a CSS at-rule that isn't part of the CSS specification. The at-rule data is provided via the [CSSTree](https://github.com/csstree/csstree) project.

Examples of incorrect code:

```css
@charse "UTF-8";

@importx url(foo.css);

@foobar {
	.my-style {
		color: red;
	}
}
```

## When Not to Use It

If you are purposely using at-rules that aren't part of the CSS specification, then you can safely disable this rule.

## Prior Art

-   [`at-rule-no-unknown`](https://stylelint.io/user-guide/rules/at-rule-no-unknown)
