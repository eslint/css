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

This rule enforces the use of layers and warns when any rule appears outside of a `@layer` block and if any layer doesn't have a name. Additionally, there are several options available to customize the behavior of this rule.

Examples of incorrect code:

```css
/* no layer name */
@import url(foo.css) layer;

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

### Options

This rule accepts an options object with the following properties:

- `allowUnnamedLayers` (default: `false`) - Set to `true` to allow layers without names.
- `layerNamePattern` (default: `""`) - Set to a regular expression string to validate all layer names.
- `requireImportsLayers` (default: `false`) - Set to `true` to require that all `@import` rules must specify a layer.

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

The `layerNamePattern` is a regular expression string that allows you to validate the name of layers and prevent misspellings.

Here's an example of **incorrect** code:

```css
/* eslint css/use-layers: ["error", { layerNamePattern: "reset|theme|base" }] */
/* possible typo */
@import url(foo.css) layer(resett);

/* unknown layer name */
@layer defaults {
	a {
		color: red;
	}
}
```

#### `requireImportLayers: true`

When `requireImportLayers` is set to `true`, the following code is **incorrect**:

```css
/* eslint css/use-layers: ["error", { requireImportLayers: true }] */
/* missing layer */
@import url(foo.css);
```

The following code is **correct**:

```css
/* eslint css/use-layers: ["error", { requireImportLayers: true }] */
@import url(foo.css) layer;
@import url(bar.css) layer(reset);
```

## When Not to Use It

If you are defining rules without layers in a file (for example, `reset.css`) and then importing that file into a layer in another file (such as, `@import url(reset.css) layer(reset)`), then you should disable this rule in the imported file (in this example, `reset.css`). This rule is only needed in the file(s) that require layers.
