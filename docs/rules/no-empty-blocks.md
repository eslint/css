# no-empty-blocks

Disallow empty blocks.

## Background

CSS blocks are indicated by opening `{` and closing `}` characters, and can occur in both at-rules and rules. For example:

```css
@media (print) {
	a {
		color: black;
	}
}
```

Sometimes during refactoring, you can end up with empty blocks in your code. This is generally a mistake and should be fixed.

## Rule Details

This rule warns when it finds a block that is empty. By default, blocks that contain only comments are not reported.

Examples of **incorrect** code:

```css
/* eslint css/no-empty-blocks: "error" */

a {
}

.class-name {
}

@media (print) {
}
```

Examples of **correct** code:

```css
/* eslint css/no-empty-blocks: "error" */

a {
	/* a comment */
}

.class-name {
	/* a comment */
}

@media (print) {
	/* a comment */
}
```

## Options

This rule accepts an option which is an object with the following property:

- `reportCommentOnlyBlocks` (default: `false`) - Set to `true` to report blocks that contain only comments.

Examples of **incorrect** code with `{ reportCommentOnlyBlocks: true }`:

```css
/* eslint css/no-empty-blocks: ["error", { reportCommentOnlyBlocks: true }] */

a {
	/* a comment */
}

.class-name {
	/* a comment */
}

@media (print) {
	/* a comment */
}
```

## When Not to Use It

If you aren't concerned with empty blocks, you can safely disable this rule.

## Prior Art

- [empty-rules](https://github.com/CSSLint/csslint/wiki/Disallow-empty-rules)
- [`block-no-empty`](https://stylelint.io/user-guide/rules/block-no-empty)
