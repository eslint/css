# no-unmatchable-selectors

Disallow unmatchable selectors.

## Background

An unmatchable selector is one that can never match any element in any document. These are effectively dead code and usually indicate mistakes.

For example:

- `a:nth-child(0)` — the `An+B` formula never produces a positive position (≥ 1).
- `a:nth-child(-n)` — a negative step with no offset never yields a positive position.

## Rule Details

This rule reports selectors that can never match any element.

It currently checks:

- `:nth-*()` pseudo-classes whose `An+B` formulas cannot produce a positive position (≥ 1).

Examples of **incorrect** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-unmatchable-selectors: "error" */

a:nth-child(0) {}
a:nth-child(-n) {}
a:nth-last-child(0 of .active) {}
a:nth-of-type(0n) {}
a:nth-last-of-type(0n+0) {}
```

Examples of **correct** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-unmatchable-selectors: "error" */

a:nth-child(1) {}
a:nth-child(even) {}
a:nth-child(odd) {}
a:nth-last-child(1 of .active) {}
a:nth-of-type(1n) {}
a:nth-last-of-type(1n+0) {}
```

## When Not to Use It

If you intentionally use selectors that can never match (for example, as temporary placeholders during development), then you can safely disable this rule.

## Prior Art

- [`selector-anb-no-unmatchable`](https://stylelint.io/user-guide/rules/selector-anb-no-unmatchable/)
