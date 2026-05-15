# use-layers

Require use of layers.

## Background

Layers are a way to organize the cascading of rules outside of their source code order. By defining named layers and describing their order, you can ensure that rules are applied in the order that best matches your use case. Here's an example:

```css
/* establish the cascade order */
@layer reset, base, theme;

/* import styles into the reset layer */
@import url("reset.css") layer(reset);

/* Theme styles */
@layer theme {
	body {
		background-color: #f0f0f0;
		color: #333;
	}
}

/* Base styles */
@layer base {
	body {
		font-family: Arial, sans-serif;
		line-height: 1.6;
	}
}
```

In general, you don't want to mix rules inside of layers with rules outside of layers because you're then dealing with two different cascade behaviors.

## Rule Details

This rule enforces the use of layers and warns when:

1. Any rule appears outside of a `@layer` block.
1. Any `@import` doesn't specify a layer.
1. If any layer doesn't have a name.

Examples of **incorrect** code:

```css
/* eslint css/use-layers: "error" */

/* no layer name */
@import url(foo.css) layer;

/* no layer */
@import url(bar.css);

/* outside of layer */
.my-style {
	color: red;
}

/* no layer name */
@layer {
	a {
		color: red;
	}
}
```

There are also additional options to customize the behavior of this rule.

### Options

This rule accepts an options object with the following properties:

- `allowUnnamedLayers` (default: `false`) - Set to `true` to allow layers without names.
- `layerNamePattern` (default: `""`) - Set to a regular expression string to validate all layer names.
- `requireImportLayers` (default: `true`) - Set to `false` to allow `@import` rules without a layer.

#### `allowUnnamedLayers: true`

When `allowUnnamedLayers` is set to `true`, the following code is **correct**:

```css
/* eslint css/use-layers: ["error", { allowUnnamedLayers: true }] */
/* no layer name */
@import url(foo.css) layer;

/* no layer name */
@layer {
	a {
		color: red;
	}
}
```

#### `layerNamePattern`

The `layerNamePattern` is a regular expression string that allows you to validate the name of layers and prevent misspellings. This option supports period-separated layer names (e.g., `foo.bar`) as defined in [CSS Cascade and Inheritance Level 5](https://drafts.csswg.org/css-cascade-5/#layer-names).

Here's an example of **incorrect** code:

```css
/* eslint css/use-layers: ["error", { layerNamePattern: "^(reset|theme|base)$" }] */
/* possible typo */
@import url(foo.css) layer(resett);

/* unknown layer name */
@layer defaults {
	a {
		color: red;
	}
}

/* unknown period-separated layer name */
@layer theme.custom {
	a {
		color: red;
	}
}
```

Each part of a period-separated layer name is validated individually against the pattern. For example, with `layerNamePattern: "^(reset|theme|base)$"`:

- `theme.base` is valid (both parts match the pattern)
- `theme.custom` is invalid (`custom` doesn't match the pattern)
- `other.base` is invalid (`other` doesn't match the pattern)

#### `requireImportLayers: false`

When `requireImportLayers` is set to `false`, the following code is **correct**:

```css
/* eslint css/use-layers: ["error", { requireImportLayers: false }] */
@import url(foo.css);
@import url(foo.css) layer;
@import url(bar.css) layer(reset);
```

## When Not to Use It

If you are defining rules without layers in a file (for example, `reset.css`) and then importing that file into a layer in another file (such as, `@import url(reset.css) layer(reset)`), then you should disable this rule in the imported file (in this example, `reset.css`). This rule is only needed in the file(s) that require layers.
