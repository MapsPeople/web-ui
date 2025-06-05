# mi-keyboard

The `<mi-keyboard>` element can be used to show a onscreen keyboard. Please note that this component is not compatible with Internet Explorer and that it should be tied to a input element with the `inputElement` attribute to output the entered value.

Working alphabetic example:

<input id="firstExample_input" type="text">
<mi-keyboard id="firstExample_keyboard" style="max-width: 800px" layout="alphabetic"></mi-keyboard>

<script>
    document.getElementById('firstExample_keyboard').inputElement = document.getElementById('firstExample_input');
</script>

Working numeric example:

<input id="secondExample_input" type="number">
<mi-keyboard id="secondExample_keyboard" style="max-width: 400px" layout="numeric"></mi-keyboard>

<script>
    document.getElementById('secondExample_keyboard').inputElement = document.getElementById('secondExample_input');;
</script>

Example usage:

```html
<!-- HTML -->

<input id="uniqueId" type="text">
<mi-keyboard layout="alphabetic"></mi-keyboard>
```

```js
// JavaScript

const inputElement = document.getElementById('uniqueId');
const keyboard = document.querySelector('mi-keyboard');
keyboard.inputElement = inputElement;
```

## `inputElement` attribute

A `inputElement` attribute is available on the `<mi-keyboard>` element, which should be used to tie the `mi-keyboard` element to the input element where the entered values should be outputted. A unique id is required for the input element set.

## `layout` attribute

A `layout` attribute is available on the `<mi-keyboard>` element, which should be used to specify the keyboard layout. When `alphabetic` is set the keyboard language layout is set automatically based on the browser's language when the component is initialized. The default value is `alphabetic`.

The following values are accepted:

* `numeric`
* `alphabetic`

Example:

```html
<!-- HTML -->

<mi-keyboard layout="alphabetic"></mi-keyboard>
```

A table showing which alphabetical layouts and languages are supported and mapped together:

| Keyboard layout        | Browser language |
| ---------------------- | ---------------- |
| unitedStatesAlphabetic | en, en-us        |
| danishAlphabetic       | da, da-dk        |
| frenchAlphabetic       | fr, fr-fr        |
| germanAlphabetic       | de, de-de        |
| italianAlphabetic      | it, it-it        |
| spanishAlphabetic      | es, es-es        |
| dutchAlphabetic        | nl, nl-nl        |
| chineseAlphabetic      | zh, zh-CN        |

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property       | Attribute  | Description                                                                                                                                                                             | Type               | Default                     |
| -------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------- |
| `inputElement` | --         | The active input element.                                                                                                                                                               | `HTMLInputElement` | `undefined`                 |
| `language`     | `language` | The keyboard language to use. Supported values are "en" (English), "fr" (French), "de", (German) and "da" (Danish). If omitted, the browser language will be used. Defaults to English. | `string`           | `undefined`                 |
| `layout`       | `layout`   | The keyboard layout to use. Defaults to alphabetic.                                                                                                                                     | `string`           | `KeyboardLayout.Alphabetic` |


## Methods

### `clearInputField() => Promise<void>`

Clear the input field.

#### Returns

Type: `Promise<void>`




----------------------------------------------


