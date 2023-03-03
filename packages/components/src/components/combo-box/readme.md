# combo-box

The `<mi-combo-box>` element can be used to display a filterable list of options to choose from.

Working examples:

<mi-combo-box id="combo-box">
        <combo-box-item value="Dog" text="Dog"></combo-box-item>
        <combo-box-item value="Cat" text="Cat"></combo-box-item>
        <combo-box-item value="Plane" text="Plane"></combo-box-item>
        <combo-box-item value="Home" text="Home"></combo-box-item>
</mi-combo-box>

<mi-combo-box id="combo-box">
        <combo-box-item value="MapsPeople" text="MapsPeople"></combo-box-item>
        <combo-box-item value="Labore vel0" text="Labore vel-0"></combo-box-item>
        <combo-box-item value="Labore vel1" text="Labore vel-1"></combo-box-item>
        <combo-box-item value="Labore vel2" text="Labore vel-2"></combo-box-item>
        <combo-box-item value="Labore vel3" text="Labore vel-3"></combo-box-item>
        <combo-box-item value="Labore vel4" text="Labore vel-4"></combo-box-item>
</mi-combo-box>

<mi-combo-box id="combo-box">
        <combo-box-item value="0" text="Item #0"></combo-box-item>
        <combo-box-item value="1" text="Item #1"></combo-box-item>
        <combo-box-item value="2" text="Item #2"></combo-box-item>
        <combo-box-item value="3" text="Item #3"></combo-box-item>
        <combo-box-item value="4" text="Item #4"></combo-box-item>
        <combo-box-item value="5" text="Item #5"></combo-box-item>
        <combo-box-item value="6" text="Item #6"></combo-box-item>
        <combo-box-item value="7" text="Item #7"></combo-box-item>
        <combo-box-item value="8" text="Item #8"></combo-box-item>
        <combo-box-item value="9" text="Item #9"></combo-box-item>
        <combo-box-item value="10" text="Item #10"></combo-box-item>
</mi-combo-box>

Example usage:

```html
<!-- HTML -->
<mi-combo-box id="combo-box">
        <combo-box-item value="Dog" text="Dog"></combo-box-item>
        <combo-box-item value="Cat" text="Cat"></combo-box-item>
        <combo-box-item value="Plane" text="Plane"></combo-box-item>
        <combo-box-item value="Home" text="Home"></combo-box-item>
</mi-combo-box>
```

```js
    const comboBoxElement = document.getElementById('combo-box');

    comboBoxElement.addEventListener('change', (event) => {
        const selectedValues = event.detail.map((item) => item.value);
    })
```

## `open` attribute

An `open` attribute is available on the `<mi-combo-box>` element, which can be used to expand the dropdown.

## `items` attribute

A `items` attribute is available on the `<mi-combo-box>` element, which should be used to set the available options.

## `itemsOrder` attribute

A `itemsOrder` attribute is available on the `<mi-combo-box>` element, which can be set to `asc` or `desc` to sort the value of the `items` attribute.

## `multiple` attribute

A `multiple` attribute is available on the `<mi-combo-box>` element, which can be set to `true` to render checkboxes.

## `noResultsMessage` attribute

A `noResultsMessage` attribute is available on the `<mi-combo-box>` element, which should be used to set the message when no items are available to be displayed in the content window. The default is `No results found`.

## `selected` attribute

A `selected` attribute is available on the `<mi-combo-box>` element, which can be used to get a list of selected `HTMLMiDropdownItemElement` items.

## `disabled` attribute

An `disabled` attribute is available on the `<mi-combo-box>` element, which can be used to set the dropdown as disabled (unusable and unclickable).

## `change` event

A `change` event is emitted from the `<mi-combo-box>` element when the selection is changed.

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

<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                                                                                                                                                                                   | Type                              | Default              |
| ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------- |
| `disabled`         | `disabled`           | Sets the disabled state for the dropdown.                                                                                                                                                     | `boolean`                         | `false`              |
| `filterable`       | `filterable`         | This attribute indicates that the items can be filtered using the input field present at the top. If it is not specified, the input field will not be visible, and filtering is not possible. | `boolean`                         | `false`              |
| `items`            | --                   | Gets or sets the list items.                                                                                                                                                                  | `HTMLMiDropdownItemElement[]`     | `[]`                 |
| `itemsOrder`       | `items-order`        | Sort order of items.                                                                                                                                                                          | `SortOrder.Asc \| SortOrder.Desc` | `undefined`          |
| `noResultsMessage` | `no-results-message` | Guiding message when presented with a content window that has no rows. Default language is English.                                                                                           | `string`                          | `'No results found'` |
| `open`             | `open`               | Gets or sets the state of the dropdown. If the attribute is set to true then the dropdown will be expanded.                                                                                   | `boolean`                         | `false`              |
| `selected`         | --                   | Gets the selected items.                                                                                                                                                                      | `HTMLMiDropdownItemElement[]`     | `[]`                 |


## Events

| Event    | Description                                      | Type               |
| -------- | ------------------------------------------------ | ------------------ |
| `change` | Triggers an event when the selection is changed. | `CustomEvent<any>` |


## Shadow Parts

| Part                   | Description |
| ---------------------- | ----------- |
| `"dropdown-container"` |             |
| `"icon-down-arrow"`    |             |


----------------------------------------------


