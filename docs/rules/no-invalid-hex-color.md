# no-invalid-hex-color

Disallows invalid hex color.

## Background

CSS hex colors can be of 3, 4, 6 or 8 hexadecimal characters. For example:

```css
a {
	color: #000;
}
.box {
	color: #000c;
}
#title {
	color: #fefefe;
}
div {
	color: #ffccbbee;
}
```

## Rule Details

This rule warns when it finds an invalid hex color in your css code.

Examples of incorrect code:

```css
a {
	color: #0000FZ;
}

div {
	color: #0;
}

#title {
	color: #ffxxzz;
}

.box {
	color: #ab99001;
}
```

## Prior Art

-   [empty-rules](https://github.com/CSSLint/csslint/wiki/Disallow-empty-rules)
-   [`block-no-empty`](https://stylelint.io/user-guide/rules/block-no-empty)
