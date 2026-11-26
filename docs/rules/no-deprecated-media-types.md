# no-deprecated-media-types

Disallow deprecated media types.

## Background

Several media types defined in earlier specifications have been deprecated and should no longer be used.

That's because they indicate the type of device, but this alone is no longer enough to distinguish between devices with different styling requirements.

Browsers still recognize these media types as valid, but they [match nothing](https://drafts.csswg.org/mediaqueries-5/#media-types), so the styles in a rule such as `@media tv {}` are never applied.

## Rule Details

This rule reports these eight deprecated media types in `@import` and `@media` rules:

- `aural`
- `braille`
- `embossed`
- `handheld`
- `projection`
- `speech`
- `tty`
- `tv`

Examples of **incorrect** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-deprecated-media-types: "error" */

@import "legacy.css" aural;

@media tv {}
@media screen, print, tty {}
@media handheld and (max-width: 1440px) {}
@media only projection and (color) {}
```

Examples of **correct** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-deprecated-media-types: "error" */

@import "legacy.css" screen;

@media screen {}
@media screen, print {}
@media (max-width: 1440px) {}
@media only screen and (color) {}
```

## Options

This rule has no options.

## When Not to Use It

If you intentionally use deprecated media types (for example, to support older browsers that still match them), then you can safely disable this rule.

## Prior Art

- [`media-type-no-deprecated`](https://stylelint.io/user-guide/rules/media-type-no-deprecated/)
- [`noDeprecatedMediaType`](https://biomejs.dev/linter/rules/no-deprecated-media-type/css/)
