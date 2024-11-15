# no-invalid-property-values

Disallow invalid property values.

## Background

CSS has a defined set of known properties that are expected to have specific values. While CSS may parse correctly, that doesn't mean that the properties are correctly matched with their values. For example, the following is syntactically valid CSS code:

```css
a {
	display: black;
}
```

The property `display` doesn't accept a color for its value, so while this code will parse without error, it's still invalid CSS.

## Rule Details

This rule warns when it finds a CSS property value that doesn't match with the property name in the CSS specification (custom properties such as `--my-color` are ignored). The property data is provided via the [CSSTree](https://github.com/csstree/csstree) project.

Examples of incorrect code:

```css
a {
	display: black;
}

body {
	overflow: 100%;
}
```

## When Not to Use It

If you aren't concerned with invalid property values, then you can safely disable this rule.
