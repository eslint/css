# no-invalid-named-grid-areas

Disallow invalid named grid areas.

## Background

CSS Grid allows you to define named grid areas using the `grid-template-areas` property. Each string in the value creates a row, and each cell token in the string creates a column. Multiple cell tokens with the same name within and between rows create a single named grid area that spans the corresponding grid cells.

A named grid area is considered invalid if:

1. The strings in the value have different numbers of cell tokens
2. No cell tokens are present
3. Cell tokens with the same name do not form a rectangle

## Rule Details

This rule prevents invalid named grid areas in CSS grid templates.

Examples of **incorrect** code:

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas: "";
}
```

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas:
		"header header header"
		"nav main main main";
}
```

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas:
		"header header header"
		"nav main main"
		"nav . main";
}
```

Examples of **correct** code:

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas:
		"header"
		"nav"
		"main";
}
```

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas:
		"header header header"
		"nav main main"
		"nav main main";
}
```

```css
/* eslint css/no-invalid-named-grid-areas: "error" */

.grid {
	grid-template-areas:
		"header header header"
		"nav . main"
		"nav . main";
}
```

## When Not to Use It

If you aren't concerned with invalid grid area definitions, then you can safely disable this rule.

## Prior Art

- [`named-grid-areas-no-invalid`](https://stylelint.io/user-guide/rules/named-grid-areas-no-invalid)
