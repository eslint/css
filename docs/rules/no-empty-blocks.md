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

This rule warns when it finds a block that is empty. For the purposes of this rule, comments do not count as content and this rule warns when the only content inside of a block is a comment.

Examples of incorrect code:

```css
a {
}

a {
}

.class-name {
	/* a comment */
}

.class-name {
	/* a comment */
}

@media (print) {
}

@media (print) {
	/* a comment */
}
```

## When Not to Use It

If you aren't concerned with empty blocks, you can safely disable this rule.

## Prior Art

-   [empty-rules](https://github.com/CSSLint/csslint/wiki/Disallow-empty-rules)
-   [`block-no-empty`](https://stylelint.io/user-guide/rules/block-no-empty)
