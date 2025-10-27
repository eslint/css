# prefer-logical-properties

Prefer logical properties over physical properties.

## Background

Logical properties are a set of CSS properties that map to their physical counterparts. They are designed to make it easier to create styles that work in both left-to-right and right-to-left languages. Logical properties are useful for creating styles that are more flexible and easier to maintain.

## Rule Details

This rule checks for the use of physical properties and suggests using their logical counterparts instead.

Examples of **incorrect** code for this rule:

```css
/* eslint css/prefer-logical-properties: "error" */

/* incorrect use of physical properties */
a {
	margin-left: 10px;
}
```

Examples of **correct** code for this rule:

```css
/* eslint css/prefer-logical-properties: "error" */

a {
	margin-inline-start: 10px;
}
```

### Options

This rule accepts an option object with the following properties:

- `allowProperties` (default: `[]`) - Specify an array of physical properties that are allowed to be used.
- `allowUnits` (default: `[]`) - Specify an array of physical units that are allowed to be used.

#### `allowProperties`

Examples of **correct** code with `{ allowProperties: ["margin-left"] }`:

```css
/* eslint css/prefer-logical-properties: ["error", { allowProperties: ["margin-left"] }] */

a {
	margin-left: 10px;
}
```

#### `allowUnits`

Examples of **correct** code with `{ allowUnits: ["vw"] }`:

```css
/* eslint css/prefer-logical-properties: ["error", { allowUnits: ["vw"] }] */

a {
	margin: 10vw;
}
```

## When Not to Use It

If you aren't concerned with the use of logical properties, then you can safely disable this rule.

## Prior Art

- [stylelint-use-logical](https://github.com/csstools/stylelint-use-logical)
