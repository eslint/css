# no-duplicate-keyframe-selectors

Disallow duplicate selectors within keyframe blocks.

## Background

The @keyframes at-rule in CSS defines intermediate steps in an animation sequence. Each keyframe selector (like `0%`, `50%`, `100%`, `from`, or `to`) represents a point in the animation timeline and contains styles to apply at that point.

```css
@keyframes test {
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}
```

If a selector is repeated within the same @keyframes block, the last declaration wins, potentially causing unintentional overrides or confusion.

## Rule Details

This rule warns when it finds a keyframe block that contains duplicate selectors.

Examples of **incorrect** code for this rule:

```css
@keyframes test {
	0% {
		opacity: 0;
	}

	0% {
		opacity: 1;
	}
}

@keyframes test {
	from {
		opacity: 0;
	}

	from {
		opacity: 1;
	}
}

@keyframes test {
	from {
		opacity: 0;
	}

	from {
		opacity: 1;
	}
}
```

Examples of **correct** code for this rule:

```css
@keyframes test {
	0% {
		opacity: 0;
	}

	100% {
		opacity: 1;
	}
}

@keyframes test {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
```

## When Not to Use It

If you aren't concerned with duplicate selectors within keyframe blocks, you can safely disable this rule.

## Prior Art

- [`keyframe-block-no-duplicate-selectors`](https://stylelint.io/user-guide/rules/keyframe-block-no-duplicate-selectors/)
