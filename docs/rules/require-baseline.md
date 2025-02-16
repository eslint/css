# require-baseline

Enforce the use of baseline features

## Background

[Baseline](https://web.dev/baseline) is an effort by the [W3C WebDX Community Group](https://github.com/web-platform-dx) to document which features are available in four core browsers: Chrome (desktop and Android), Edge, Firefox (desktop and Android), and Safari (macOS and iOS). This data allows developers to choose the technologies that are best supported for their audience. As part of this effort, Baseline tracks which CSS features are available in which browsers.

Features are grouped into three levels:

- **Widely available** features are those supported by all core browsers for at least 30 months.
- **Newly available** features are those supported by all core browsers for less than 30 months.
- **Limited availability** features are those supported by some but not all core browsers.

Generally speaking, it's preferable to stick to widely available features to ensure the greatest interoperability across browsers.

## Rule Details

This rule warns when it finds any of the following:

- A CSS property that isn't widely available or otherwise isn't enclosed in a `@supports` block.
- An at-rule that isn't widely available.
- A media condition inside `@media` that isn't widely available.
- A CSS property value that isn't widely available or otherwise isn't enclosed in a `@supports` block (currently limited to identifiers only).
- A CSS property function that isn't widely available.

The data is provided via the [web-features](https://npmjs.com/package/web-features) package.

Here are some examples:

```css
/* invalid - accent-color is not widely available */
a {
	accent-color: red;
}

/* invalid - abs is not widely available */
.box {
	width: abs(20% - 100px);
}

/* invalid - device-posture is not widely available */
@media (device-posture: folded) {
	a {
		color: red;
	}
}

/* invalid - property value doesn't match @supports indicator */
@supports (accent-color: auto) {
	a {
		accent-color: abs(20% - 10px);
	}
}

/* valid - @supports indicates you're choosing a limited availability property */
@supports (accent-color: auto) {
	a {
		accent-color: auto;
	}
}

/* invalid - @supports says that this property isn't available */
@supports not (accent-color: auto) {
	a {
		accent-color: auto;
	}
}
```

### Options

This rule accepts an option object with the following properties:

- `available` (default: `"widely"`) - change to `"newly"` available to allow a larger number of properties and at-rules.

## When Not to Use It

If your web application doesn't target all Baseline browsers then you can safely disable this rule.

## Further Reading

- [How do things become baseline?](https://web.dev/baseline#how-do-things-become-baseline)
