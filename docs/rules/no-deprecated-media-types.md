# no-deprecated-media-types

Disallow deprecated media types.

## Background

Some media types were defined in earlier specifications but they should no longer be used.

That's because they indicate the type of device, but this alone is no longer enough to distinguish between devices with different styling requirements.

For example:

<!-- prettier-ignore -->
```css
@media tv {}

@media handheld {}
```

## Rule Details

This rule reports these eight deprecated media types in `@media` rules.

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

@media tv {}
@media screen, print, tty {}
@media handheld and (max-width: 1440px) {}
@media only projection and (color) {}
```

Examples of **correct** code:

<!-- prettier-ignore -->
```css
/* eslint css/no-deprecated-media-types: "error" */

@media screen {}
@media screen, print {}
@media (max-width: 1440px) {}
@media only screen and (color) {}
```

## Options

This rule has no options.

## When Not to Use It

If you intentionally use deprecated media types for demonstration purposes, you can disable this rule.

## Prior Art

- [`media-type-no-deprecated`](https://stylelint.io/user-guide/rules/media-type-no-deprecated/)
- [`noDeprecatedMediaType`](https://biomejs.dev/linter/rules/no-deprecated-media-type/css/)
