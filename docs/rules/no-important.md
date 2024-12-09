# no-important

Disallow `!important` annotations.

## Background

Needing !important indicates there may be a larger underlying issue.

## Rule Details

Examples of incorrect code:

```css
a {
	color: red !important;
}

a .link {
	font-size: padding: 10px 20px 30px 40px !important;
}
```
