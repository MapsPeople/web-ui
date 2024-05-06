# mi-dropdown-item

The `<mi-dropdown-item>` element can be used to display a list items inside the `<mi-dropdown>` element.

Working example:

<mi-dropdown style="margin-bottom: 16px;" items-order="asc">
    <mi-dropdown-item selected value="Lorem ipsum" text="Lorem ipsum"></mi-dropdown-item>
    <mi-dropdown-item excludefromall value="Dolor sit" text="Dolor sit"></mi-dropdown-item>
    <mi-dropdown-item disabled value="Amet Consectetur" text="Amet Consectetur Amet Consectetur Amet Consectetur Amet"></mi-dropdown-item>
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
    <mi-dropdown-item excludefromall value="Dolor sit" text="Dolor sit"></mi-dropdown-item>
    <mi-dropdown-item disabled value="Amet Consectetur" text="Amet Consectetur Amet Consectetur Amet Consectetur Amet"></mi-dropdown-item>
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

## `title` attribute

Set the `title` attribute to add extra information about an item.

## `disabled` attribute

A `disabled` attribute is available on the `<mi-dropdown-item>` element, which can be used to mark the element disabled.

## `excludefromall` attribute

An `excludefromall` attribute is available on the `<mi-dropdown-item>` element, which can be used to exclude this element when the wrapping `<mi-dropdown>` element's `selectAll` function is used.

## `selected` attribute

A `selected` attribute is available on the `<mi-dropdown-item>` element, which can be used to mark the element selected.

## `text` attribute

A `text` attribute is available on the `<mi-dropdown-item>` element, which can be used to display the visible text content of the element.

## `value` attribute

A `value` attribute is available on the `<mi-dropdown-item>` element, which can be used to specify the value of the element.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property         | Attribute        | Description | Type      | Default     |
| ---------------- | ---------------- | ----------- | --------- | ----------- |
| `disabled`       | `disabled`       |             | `boolean` | `false`     |
| `excludefromall` | `excludefromall` |             | `boolean` | `false`     |
| `selected`       | `selected`       |             | `boolean` | `false`     |
| `text`           | `text`           |             | `string`  | `undefined` |
| `value`          | `value`          |             | `string`  | `undefined` |


----------------------------------------------


