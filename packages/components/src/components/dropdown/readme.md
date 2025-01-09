# mi-dropdown

The `<mi-dropdown>` element can be used to display a list of options to choose from.

Working examples:

<mi-dropdown style="margin-bottom: 16px;" items-order="asc">
    <mi-dropdown-item selected value="Lorem ipsum" text="Lorem ipsum"></mi-dropdown-item>
    <mi-dropdown-item selected value="Dolor sit" text="Dolor sit"></mi-dropdown-item>
    <mi-dropdown-item value="Amet Consectetur" text="Amet Consectetur Amet Consectetur Amet Consectetur Amet"></mi-dropdown-item>
    <mi-dropdown-item value="Adipisicing elit" text="Adipisicing elit"></mi-dropdown-item>
    <mi-dropdown-item value="Labore vel" text="Labore vel"></mi-dropdown-item>
</mi-dropdown>

<mi-dropdown label="Buildings" filterable multiple items-order="asc">
    <mi-dropdown-item selected value="Lorem ipsum" text="Lorem ipsum"></mi-dropdown-item>
    <mi-dropdown-item selected value="Dolor sit" text="Dolor sit"></mi-dropdown-item>
    <mi-dropdown-item value="Amet Consectetur" text="Amet Consectetur"></mi-dropdown-item>
    <mi-dropdown-item value="Adipisicing elit" text="Adipisicing elit"></mi-dropdown-item>
    <mi-dropdown-item value="Labore vel" text="Labore vel"></mi-dropdown-item>
</mi-dropdown>

<mi-dropdown label="Lorem ipsum" filterable multiple items-order="asc" open>
    <mi-dropdown-item selected value="Lorem ipsum">Lorem ipsum<img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/account_circle/v16/24px.svg" height="16" /></mi-dropdown-item>
    <mi-dropdown-item selected value="Dolor sit"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/face/v15/24px.svg" height="16" />Dolor sit</mi-dropdown-item>
    <mi-dropdown-item value="Amet Consectetur"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/settings/v18/24px.svg" height="16" />Amet Consectetur</mi-dropdown-item>
    <mi-dropdown-item value="Adipisicing elit"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/pets/v12/24px.svg" height="16" />Adipisicing elit</mi-dropdown-item>
    <mi-dropdown-item value="Labore vel">Labore vel</mi-dropdown-item>
</mi-dropdown>

Example usage:

```html
<!-- HTML -->
<mi-dropdown style="margin-bottom: 16px;" items-order="asc">
    <mi-dropdown-item selected value="Lorem ipsum" text="Lorem ipsum"></mi-dropdown-item>
    <mi-dropdown-item selected value="Dolor sit" text="Dolor sit"></mi-dropdown-item>
    <mi-dropdown-item value="Amet Consectetur" text="Amet Consectetur Amet Consectetur Amet Consectetur Amet"></mi-dropdown-item>
    <mi-dropdown-item value="Adipisicing elit" text="Adipisicing elit"></mi-dropdown-item>
    <mi-dropdown-item value="Labore vel" text="Labore vel"></mi-dropdown-item>
</mi-dropdown>

<!--With item icons-->
<mi-dropdown label="Lorem ipsum" filterable multiple items-order="asc" open>
    <mi-dropdown-item selected value="Lorem ipsum">Lorem ipsum<img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/account_circle/v16/24px.svg" height="16" /></mi-dropdown-item>
    <mi-dropdown-item selected value="Dolor sit"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/face/v15/24px.svg" height="16" />Dolor sit</mi-dropdown-item>
    <mi-dropdown-item value="Amet Consectetur"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/settings/v18/24px.svg" height="16" />Amet Consectetur</mi-dropdown-item>
    <mi-dropdown-item value="Adipisicing elit"><img src="https://fonts.gstatic.com/s/i/materialiconsoutlined/pets/v12/24px.svg" height="16" />Adipisicing elit</mi-dropdown-item>
    <mi-dropdown-item value="Labore vel">Labore vel</mi-dropdown-item>
</mi-dropdown>
```

```js
// JavaScript

const miDropdownElement = document.querySelector("mi-dropdown");

miDropdownElement.addEventListener("change", (event) => {
    const selectedValues = event.detail.map((item) => item.value);
    console.log(selectedValues);
});
```

## `open` attribute

An `open` attribute is available on the `<mi-dropdown>` element, which can be used to expand the dropdown.

## `items` attribute

A `items` attribute is available on the `<mi-dropdown>` element, which should be used to set the available options.

## `itemsOrder` attribute

A `itemsOrder` attribute is available on the `<mi-dropdown>` element, which can be set to `asc` or `desc` to sort the value of the `items` attribute.

## `label` attribute

A `label` attribute is available on the `<mi-dropdown>` element, which should be used to set the display label. The attribute is required when the `multiple` attribute is set.

## `filterable` attribute

A `filterable` attribute is available on the `<mi-dropdown>` element, which can be set to `true` to render a search field.

## `multiple` attribute

A `multiple` attribute is available on the `<mi-dropdown>` element, which can be set to `true` to render checkboxes.

## `noResultsMessage` attribute

A `noResultsMessage` attribute is available on the `<mi-dropdown>` element, which should be used to set the message when no items are available to be displayed in the content window. The default is `No results found`.

## `selected` attribute

A `selected` attribute is available on the `<mi-dropdown>` element, which can be used to get a list of selected `HTMLMiDropdownItemElement` items.

## `icon` attribute

An `icon` attribute is available on the `<mi-dropdown>` element, which is used to render an icon on the left side of the component. No icon is rendered by default.

## `iconAlt` attribute

An `iconAlt` attribute is available on the `<mi-dropdown>` element, which should be used to set the alternative text for the image to increase accessibility.

## `disabled` attribute

An `disabled` attribute is available on the `<mi-dropdown>` element, which can be used to set the dropdown as disabled (unusable and unclickable).

## `change` event

A `change` event is emitted from the `<mi-dropdown>` element when the selection is changed.

## Styling

On [modern browsers](https://caniuse.com/?search=%3A%3Apart), parts of the component style can be overriden using the CSS pseudo-element `::part()`.

The following parts are available for styling:

- `button`: Styles the button.
- `button-icon`: Styles the icon on the left-hand side.
- `button-label`: Styles the textual content inside the button.
- `icon-down-arrow`: Styles the SVG icon on the right-hand side.
- `dropdown-container`: Styles the container in which the contents are.

### Styling Example

```css
/* CSS */

mi-dropdown::part(button) {
    color: #fcfcfc;
    background: #3ba064;
}
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property             | Attribute            | Description                                                                                                                                                                                   | Type                              | Default               |
| -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------- |
| `disabled`           | `disabled`           | Sets the disabled state for the dropdown.                                                                                                                                                     | `boolean`                         | `false`               |
| `dropdownAlignment`  | `alignment`          | Sets the alignment of the dropdown. The default alignment is 'left'.                                                                                                                          | `"left" \| "right"`               | `'left'`              |
| `filterable`         | `filterable`         | This attribute indicates that the items can be filtered using the input field present at the top. If it is not specified, the input field will not be visible, and filtering is not possible. | `boolean`                         | `false`               |
| `iconAlt`            | `icon-alt`           | Sets the alternative text for the icon.                                                                                                                                                       | `string`                          | `undefined`           |
| `iconSrc`            | `icon`               | Sets the icon on the left-hand side of the component.                                                                                                                                         | `string`                          | `undefined`           |
| `items`              | --                   | Gets or sets the list items.                                                                                                                                                                  | `HTMLMiDropdownItemElement[]`     | `[]`                  |
| `itemsOrder`         | `items-order`        | Sort order of items.                                                                                                                                                                          | `SortOrder.Asc \| SortOrder.Desc` | `undefined`           |
| `label` _(required)_ | `label`              | The label will be displayed in as the text of the dropdown if the attribute multiple is present. Only required if multiple is present.                                                        | `string`                          | `undefined`           |
| `multiple`           | `multiple`           | This attribute indicates that multiple items can be selected in the list. If it is not specified, then only one item can be selected at a time.                                               | `boolean`                         | `false`               |
| `noResultsMessage`   | `no-results-message` | Guiding message when presented with a content window that has no rows. Default language is English.                                                                                           | `string`                          | `'No results found'`  |
| `open`               | `open`               | Gets or sets the state of the dropdown. If the attribute is set to true then the dropdown will be expanded.                                                                                   | `boolean`                         | `false`               |
| `placeholder`        | `placeholder`        | If present, it dictates placeholder for an filterable input field in the dropdown. Defaults to 'Type to filter...'.                                                                           | `string`                          | `'Type to filter...'` |
| `selected`           | --                   | Gets the selected items.                                                                                                                                                                      | `HTMLMiDropdownItemElement[]`     | `[]`                  |


## Events

| Event     | Description                                      | Type                |
| --------- | ------------------------------------------------ | ------------------- |
| `change`  | Triggers an event when the selection is changed. | `CustomEvent<any>`  |
| `cleared` | Emit an event when search field is cleared.      | `CustomEvent<void>` |


## Methods

### `clearFilter() => Promise<void>`

Clear filter.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part                   | Description |
| ---------------------- | ----------- |
| `"button"`             |             |
| `"button-icon"`        |             |
| `"button-label"`       |             |
| `"dropdown-container"` |             |
| `"icon-down-arrow"`    |             |


----------------------------------------------


