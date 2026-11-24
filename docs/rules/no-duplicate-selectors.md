# no-duplicate-selectors

Disallow duplicate selectors.

## Background

A stylesheet can contain two style rules with the same selector. This often occurs by accident, for example after a copy-and-paste operation or a merge conflict, and the two rules can be far apart. The browser applies both rules, but the declarations of the later rule override the declarations of the earlier rule. Thus, a change to the earlier rule can seem to have no effect. Also, it is more difficult to find all the declarations for one selector.

```css
.card {
	color: black;
}

/* Many lines later */

.card {
	color: gray; /* Overrides the color of the first rule */
}
```

## Rule Details

This rule reports:

- A style rule that has the same selector list as an earlier style rule in the same context.
- A selector that occurs more than once in a selector list.

Two style rules are in the same context if the at-rules that contain them have the same names and preludes, in the same order. Each anonymous `@layer {}` block is a different cascade layer, and thus a different context.

The rule resolves nested selectors as the [CSS Nesting specification](https://drafts.csswg.org/css-nesting/) defines. If the parent rule has more than one selector, `&` has the same meaning as `:is()` with these selectors. For example, `a, b { c {} }` has the same selector as `:is(a, b) c {}`, but not as `a c, b c {}`.

This rule ignores:

- Whitespace and comments.
- The order of the simple selectors in a compound selector, for example `.a.b` and `.b.a`. The simple selectors after a pseudo-element keep their order.
- The order of the selectors in the arguments of pseudo-classes, for example `:is(.a, .b)` and `:is(.b, .a)`.
- The selectors in `@keyframes` rules.
- A rule with only `&` as its selector, directly in a style rule, for example `.a { & {} }`. Such a rule keeps declarations after nested rules in source order.

Examples of **incorrect** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-duplicate-selectors: "error" */

.foo {}
.bar {}
.foo {}

.baz,
.qux,
.baz {}

a, b {}
b, a {}

@media (min-width: 600px) {
	.foo {}
}

@media (min-width: 600px) {
	.foo {}
}

a {
	b {}
}

a b {}
```

Examples of **correct** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-duplicate-selectors: "error" */

.foo {}
.bar {}
.foo .bar {}
.bar .foo {}

a {}
a, b {}

.baz {}

@media (min-width: 600px) {
	.baz {}
}

.qux {
	.qux {}
}
```

## Options

This rule has no options.

## When Not to Use It

If you repeat selectors on purpose, for example to put declarations into groups by topic, you can disable this rule.

## Prior Art

- [`no-duplicate-selectors`](https://stylelint.io/user-guide/rules/no-duplicate-selectors/)
- [`noDuplicateSelectors`](https://biomejs.dev/linter/rules/no-duplicate-selectors/css/)
