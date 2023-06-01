# MapsIndoors Design Tokens (midt)

`midt` contains the MapsIndoors Design Tokens and tools to use them.

The tokes are compiled from JSON to SCSS mixins using [Amazon's Style Dictionary](https://github.com/amzn/style-dictionary), but you can use them as JSON objects or CSS classes too.

Install from `npm` using `npm i -D @mapsindoors/midt@latest`.

This repository uses `main` as the primary branch.

<details><summary><b>Use the SCSS mixins</b></summary>

Using the color-`@mixin` on a class in your CSS could look like this:

```css
.test {
  @include color.red(60);
}
```

If you want to make the color a shade darker, increase the number:

```css
.test {
  @include color.red(70);
}
```

You can use the same principles for applying padding or margin to an element like this:

```css
.test {
  @include margin(xx-large);
  @include padding(small);
}
```

Or set the z-index:

```css
.test {
  @include z-index(toast);
}
```

</details>

<details><summary><b>Use with SASS' <code>@use</code> function</b></summary>

SASS is moving away from explicitly `@import`ing towards [declaring what you want to `@use`](https://sass-lang.com/documentation/at-rules/use) instead:

```scss
@use 'color';

.test {
  @include color.red(60);
}
```

</details>

<details><summary><b>List of available mixins</b></summary>

These are all of the available mixins, and how you can reference them after installing this package:

```scss
@use "node_modules/midt/background-color";
@use "node_modules/midt/border-color";
@use "node_modules/midt/border-radius";
@use "node_modules/midt/border";
@use "node_modules/midt/color";
@use "node_modules/midt/elevation";
@use "node_modules/midt/font";
@use "node_modules/midt/icons";
@use "node_modules/midt/margin";
@use "node_modules/midt/opacity";
@use "node_modules/midt/padding";
@use "node_modules/midt/sizing";
@use "node_modules/midt/transitions";
@use "node_modules/midt/z-index";
```

</details>

<details><summary><b>Build</b></summary>

1. Clone this repository `git clone git@github:mapspeople/web-ui.git && cd web-ui/packages/midt`
2. Build the Design Tokens using `style-dictionary`:

```bash
npm run build
```

You should see something like this output:

```bash
> midt@1.0.0 build ~/dev/midt
> style-dictionary build

scss
✔︎  build/scss/_variables.scss
```

If you want to watch for changes to the `properties` folder, you can use `npm run watch` and `_variables.scss` will be updated continuously.

You can read more about how Style Dictionary handles the merging and compilation of the JSON-files in the [Style Dictionary repository](https://github.com/amzn/style-dictionary).
</details>
