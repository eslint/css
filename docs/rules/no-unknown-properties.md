# no-unknown-properties

Disallow unknown properties.

## Background

CSS rules may contain any number of properties consisting of a name and a value. As long as the property name is valid CSS, it will parse correctly, even if the property won't be recognized by a web browser. For example:

```css
a {
	ccolor: black;
}
```

Here, `ccolor` is a syntactically valid identifier even though it will be ignored by browsers. Such errors are often caused by typos.

## Rule Details

This rule warns when it finds a CSS property that isn't part of the CSS specification and aren't custom properties (beginning with `--` and in `--my-color`). The property data is provided via the [CSSTree](https://github.com/csstree/csstree) project.

Examples of incorrect code:

```css
a {
	ccolor: black;
}

body {
	bg: red;
}
```

## When Not to Use It

If you aren't concerned with unknown properties, you can safely disable this rule.

## Prior Art

-   [`known-properties`](https://github.com/CSSLint/csslint/wiki/Require-use-of-known-properties)
-   [`property-no-unknown`](https://stylelint.io/user-guide/rules/property-no-unknown)
