# no-important

Disallow `!important` flags.

## Background

The `!important` flag is a CSS declaration modifier that overrides normal cascade behavior, forcing a declaration to take precedence over competing rules—regardless of specificity or source order. While it can be necessary in rare cases (e.g., overriding third-party styles or enforcing accessibility fixes), it’s widely considered an anti-pattern because:

- It breaks the natural cascade of CSS
- It makes debugging more difficult
- It can lead to specificity wars where developers keep adding more `!important` declarations to override each other
- It makes the code harder to maintain

## Rule Details

This rule warns when it detects the `!important` flag in declarations. This includes declarations within `@keyframes` rules, where `!important` is ignored by browsers and should be avoided.

Examples of incorrect code:

```css
.foo {
	color: red !important;
}

@keyframes fade {
	from {
		opacity: 0;
	}
	to {
		opacity: 1 !important; /* This is ignored by browsers */
	}
}
```

Examples of correct code:

```css
.foo {
	color: red;
}

@keyframes fade {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
```

## When Not to Use It

You may disable this rule if you are using `!important` in these specific cases:

- Overriding third-party styles where you lack control over the source CSS
- Fixing accessibility issues (e.g., enforcing focus states or color contrast)
- Working with legacy code where refactoring isn’t feasible

## Prior Art

- [`important`](https://github.com/CSSLint/csslint/wiki/Disallow-%21important)
- [`declaration-no-important`](https://stylelint.io/user-guide/rules/declaration-no-important/)
