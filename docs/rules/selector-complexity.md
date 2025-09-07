# selector-complexity

Limit and disallow the CSS selectors.

## Background

The CSS selectors are used to target HTML elements so that styles can be applied to them. Selectors can target HTML element tags, IDs, classes, or attributes applied to elements. Selectors can use simple syntax, such as targeting only IDs, classes, or HTML tags, or more complex syntax by combining classes, IDs, attributes, pseudo-classes, pseudo-elements and combinators to match specific elements or groups of elements.

It is a good practice to refrain from using complex selectors to improve maintainability and readability of code, reduce specificity issues, enhance performance, prevent bugs etc.

## Rule Details

This rule limits the use of descendant selectors and disallows certain selectors or combinators to prevent overly complex CSS selectors.

### Options

This rule accepts an option object with the following properties:

- `maxIds` (default: `Infinity`) -
  Specify the number of `ID`s can be used in a selector.
- `maxClasses` (default: - `Infinity`) -
  Specify the number of `class`es can be used in a selector.
- `maxTypes` (default: `Infinity`) -
  Specify the number of `type`s can be used in a selector.
- `maxAttributes` (default: `Infinity`) -
  Specify the number of `attribute`s can be used in a selector.
- `maxPseudoClasses` (default: `Infinity`) -
  Specify the number of `pseudo-class`es can be used in a selector.
- `maxUniversals` (default: `Infinity`) -
  Specify the number of `universal`s can be used in a selector.
- `maxCompounds` (default: `Infinity`) -
  Specify the number of `compound`s can be used in a selector.
- `maxCombinators` (default: `Infinity`) -
  Specify the number of `combinator`s can be used in a selector.
- `disallowCombinators` (default: `[]`) -
  Specify an array of `combinator`s that are not allowed to be used.
- `disallowPseudoClasses` (default: `[]`) -
  Specify an array of `pseudo-class`es that are not allowed to be used.
- `disallowPseudoElements` (default: `[]`) -
  Specify an array of `pseudo-element`s that are not allowed to be used.
- `disallowAttributes` (default: `[]`) -
  Specify an array of `attribute`s that are not allowed to be used.
- `disallowAttributeMatchers` (default: `[]`) -
  Specify an array of `attribute-matchers`s or `operator`s that are not allowed to be used.

#### `maxIds`

Examples of **incorrect** code with `{ maxIds: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxIds: 1 }] */

#foo #bar {
}

#foo > #bar {
}
```

Examples of **correct** code with `{ maxIds: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxIds: 1 }] */

#foo {
}

#foo,
#bar {
}

#foo:not(#bar) {
}
```

#### `maxClasses`

Examples of **incorrect** code with `{ maxClasses: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxClasses: 2 }] */

.foo .bar .baz {
}

.foo > .bar > .baz {
}

a.foo a.bar .baz {
}
```

Examples of **correct** code with `{ maxClasses: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxClasses: 2 }] */

.foo .bar {
}

.foo .bar,
.baz {
}

a.foo a.bar {
}
```

#### `maxTypes`

Examples of **incorrect** code with `{ maxTypes: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxTypes: 2 }] */

ul li a {
}

div.foo p a {
}
```

Examples of **correct** code with `{ maxTypes: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxTypes: 2 }] */

li a {
}

li.foo a {
}

button img:not(img.foo) {
}
```

#### `maxAttributes`

Examples of **incorrect** code with `{ maxAttributes: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxAttributes: 1 }] */

[name="foo"][type="text"] {
}

input:not([name="bar"][disabled]) {
}
```

Examples of **correct** code with `{ maxAttributes: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxAttributes: 1 }] */

[name="foo"] {
}

[type="number"] {
}
```

#### `maxPseudoClasses`

Examples of **incorrect** code with `{ maxPseudoClasses: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxPseudoClasses: 1 }] */

button:hover + a:visited {
}

.foo:first-child:hover {
}
```

Examples of **correct** code with `{ maxPseudoClasses: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxPseudoClasses: 1 }] */

button:hover + a {
}

li:nth-child(2) a {
}
```

#### `maxUniversals`

Examples of **incorrect** code with `{ maxUniversals: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxUniversals: 1 }] */

* * {
}
```

Examples of **correct** code with `{ maxUniversals: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxUniversals: 1 }] */

* {
}
```

#### `maxCompounds`

Examples of **incorrect** code with `{ maxCompounds: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxCompounds: 2 }] */

div p.foo span {
}

.foo #bar > a {
}
```

Examples of **correct** code with `{ maxCompounds: 2 }`:

```css
/* eslint css/selector-complexity: ["error", { maxCompounds: 2 }] */

p.foo span {
}

#bar a,
button {
}
```

#### `maxCombinators`

Examples of **incorrect** code with `{ maxCombinators: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxCombinators: 1 }] */

.foo > .bar > .baz {
}

.foo + .bar > a {
}
```

Examples of **correct** code with `{ maxCombinators: 1 }`:

```css
/* eslint css/selector-complexity: ["error", { maxCombinators: 1 }] */

.foo + .bar {
}

.foo ~ p {
}
```

#### `disallowCombinators`

Examples of **incorrect** code with `{ disallowCombinators: [">"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowCombinators: [">"] }] */

.foo > .bar {
}

.foo + .bar > a {
}
```

Examples of **correct** code with `{ disallowCombinators: [">"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowCombinators: [">"] }] */

.foo + .bar {
}

.foo ~ p {
}
```

#### `disallowPseudoClasses`

Examples of **incorrect** code with `{ disallowPseudoClasses: ["hover"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowPseudoClasses: ["hover"] }] */

button:hover {
}

a:not(.foo):hover {
}
```

Examples of **correct** code with `{ disallowPseudoClasses: ["hover"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowPseudoClasses: ["hover"] }] */

ul li:nth-child(2) {
}

a:not(.foo) {
}
```

#### `disallowPseudoElements`

Examples of **incorrect** code with `{ disallowPseudoElements: ["marker"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowPseudoElements: ["marker"] }] */

li::marker {
}
```

Examples of **correct** code with `{ disallowPseudoElements: ["marker"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowPseudoElements: ["marker"] }] */

input::placeholder {
}
```

#### `disallowAttributes`

Examples of **incorrect** code with `{ disallowAttributes: ["class", "alt"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowAttributes: ["class", "alt"] }] */

[class*="foo"] {
}

img[alt="foo"] {
}
```

Examples of **correct** code with `{ disallowAttributes: ["class", "alt"] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowAttributes: ["class", "alt"] }] */

input[type="text"] {
}

img[src$=".foo"] {
}
```

#### `disallowAttributeMatchers`

Examples of **incorrect** code with `{ disallowAttributeMatchers: ["*=", "^="] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowAttributeMatchers: ["*=", "^="] }] */

[class*="foo"] {
}

img[alt^="foo"] {
}
```

Examples of **correct** code with `{ disallowAttributeMatchers: ["*=", "^="] }`:

```css
/* eslint css/selector-complexity: ["error", { disallowAttributeMatchers: ["*=", "^="] }] */

input[class="foo"] {
}

img[alt="foo-bar"] {
}
```

## When Not to Use It

If you aren't concerned with the complexity of the selectors, then you can safely disable this rule.

## Prior Art

- [selector-max-id](https://stylelint.io/user-guide/rules/selector-max-id/)
- [selector-max-class](https://stylelint.io/user-guide/rules/selector-max-class/)
- [selector-max-type](https://stylelint.io/user-guide/rules/selector-max-type/)
- [selector-max-attribute](https://stylelint.io/user-guide/rules/selector-max-attribute/)
- [selector-max-pseudo-class](https://stylelint.io/user-guide/rules/selector-max-pseudo-class/)
- [selector-max-universal](https://stylelint.io/user-guide/rules/selector-max-universal/)
- [selector-max-compound-selectors](https://stylelint.io/user-guide/rules/selector-max-compound-selectors/)
- [selector-max-combinators](https://stylelint.io/user-guide/rules/selector-max-combinators/)
- [selector-combinator-disallowed-list](https://stylelint.io/user-guide/rules/selector-combinator-disallowed-list/)
- [selector-pseudo-class-disallowed-list](https://stylelint.io/user-guide/rules/selector-pseudo-class-disallowed-list/)
- [selector-pseudo-element-disallowed-list](https://stylelint.io/user-guide/rules/selector-pseudo-element-disallowed-list/)
- [selector-attribute-name-disallowed-list](https://stylelint.io/user-guide/rules/selector-attribute-name-disallowed-list/)
- [selector-attribute-operator-disallowed-list](https://stylelint.io/user-guide/rules/selector-attribute-operator-disallowed-list/)
