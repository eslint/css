# no-unknown-animations

Disallow unknown animation names.

## Background

CSS animations are created by assigning a [`@keyframes`](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) rule's name to the [`animation-name`](https://developer.mozilla.org/en-US-US/docs/Web/CSS/animation-name) property or the [`animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) shorthand property, as in this example:

```css
.card {
	animation: fade-in 300ms ease;
}

@keyframes fade-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
```

If an animation name doesn't match any `@keyframes` rule, for example because of a typo or because the `@keyframes` rule was renamed or removed, the animation silently fails to run without any error.

## Rule Details

This rule warns when an animation name used in `animation` or `animation-name` doesn't match any `@keyframes` rule defined in the same source. Vendor-prefixed properties such as `-webkit-animation` are checked too, and a vendor-prefixed `@keyframes` rule defines an animation name just like an unprefixed one does.

Animation names are case-sensitive, and quoted and unquoted names refer to the same animation, so `animation-name: "fade-in"` matches `@keyframes fade-in`.

The rule only checks statically determinable animation names. A `var()` contributes the animation name in its fallback, if it has one, and the rest of the value is checked either way:

```css
/* `fade-in` is checked, the duration is not */
animation: fade-in var(--duration);

/* the fallback names an animation, so `slide-in` is checked */
animation-name: var(--animation-name, slide-in);

/* no name can be determined, so nothing is checked */
animation-name: var(--animation-name);
```

Examples of **incorrect** code for this rule:

```css
/* eslint css/no-unknown-animations: "error" */

.card {
	animation: fade-in 300ms ease;
}

.button {
	animation-name: slide-up;
}

@keyframes fade-out {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}
```

Examples of **correct** code for this rule:

```css
/* eslint css/no-unknown-animations: "error" */

.card {
	animation: fade-in 300ms ease;
}

.button {
	animation-name: slide-up;
}

@keyframes fade-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes slide-up {
	from {
		transform: translateY(8px);
	}

	to {
		transform: translateY(0);
	}
}
```

## When Not to Use It

Animations can reference `@keyframes` rules defined in another stylesheet, but this rule only checks `@keyframes` rules defined in the same source. If your `@keyframes` rules are defined separately from where the animations are used, you should not use this rule.

## Prior Art

- [`no-unknown-animations`](https://stylelint.io/user-guide/rules/no-unknown-animations/)
