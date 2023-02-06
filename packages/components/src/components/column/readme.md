# mi-column

The `<mi-column>` element can be used to define a column within a `<mi-data-table>` element.

Working example:

<mi-data-table>
    <mi-column label="ID" binding="id"></mi-column>
    <mi-column label="Title" binding="title" sortable sort="asc"></mi-column>
    <mi-column id="button-column"><button class="mi-button mi-button--primary">?</button></mi-column>
</mi-data-table>

<script>
const tableData = [
    { id: 1, title: 'Kitchen'},
    { id: 2, title: 'Living Room'},
    { id: 3, title: 'Bedroom'},
];
document.querySelector('mi-data-table').rows = tableData;
document.getElementById('button-column').addEventListener('clicked', event => alert(event.detail.title));
</script>

Example usage:

```html
<!-- HTML -->

<mi-data-table>
    <mi-column label="ID" binding="id"></mi-column>
    <mi-column label="Title" binding="title" sortable sort="asc"></mi-column>
    <mi-column id="button-column"><button class="mi-button mi-button--primary">?</button></mi-column>
</mi-data-table>
```

```js
// JavaScript

const tableData = [
    { id: 1, title: 'Kitchen'},
    { id: 2, title: 'Living Room'},
    { id: 3, title: 'Bedroom'},
];
document.querySelector('mi-data-table').rows = tableData;
document.getElementById('button-column').addEventListener('clicked', event => alert(event.detail.title));
```

## `align-content` attribute

The `align-content` attribute can be used to align the content of the column. Possible values are `left`, `center`, or `right`. The default value is `left`.

## `binding` attribute

The `binding` attribute can be used to specify what part of the row data to display.
Eg. having row data like `[ { id: 1, title: "Living Room" }, {...} ]`, when using `binding="title"` the `title` value from the data will be displayed (in this example `Living Room`).

You can also omit the binding and compose the content yourself by providing it as inner content of the column element. You are able to use data interpolation as well. Eg.
`<mi-column>Identifier <strong>{id}</strong></mi-column>`. This approach will also enable you to use
[MapsIndoors CSS](https://www.npmjs.com/package/@mapsindoors/css) classes and [MIDT](https://www.npmjs.com/package/@mapsindoors/midt) classes.

## `label` attribute

The `label` attribute can be used to set the content of the column heading (tr element) in the table. If omitted, the `binding` name will be used.

## `sort` attribute

The `sort` attribute is used to pre-sort the table by a specific column. Possible values are `asc` or `desc`.

## `sortable` attribute

The `sortable` attribute can be used to indicate that the table can be sorted by this column content. For sorting by date use `sortable="date"`.

## `width` attribute

The `width` attribute sets the width of the column. All CSS length units are accepted. The default value is `auto`.

## `clicked` event

A `clicked` event is emitted from the `<mi-column>` element when content inside the cells have been clicked. Event payload contains the row data.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                        | Type      | Default     |
| -------------- | --------------- | ---------------------------------------------------------------------------------- | --------- | ----------- |
| `alignContent` | `align-content` | The alignContent property sets the alignment of the column's content.              | `string`  | `'left'`    |
| `binding`      | `binding`       | The name of the property on the row object which value will be displayed.          | `string`  | `undefined` |
| `fitContent`   | `fit-content`   | If present, the column width is fitted the content.                                | `boolean` | `false`     |
| `label`        | `label`         | The label that will be shown in the table header.                                  | `string`  | `undefined` |
| `monospace`    | `monospace`     | The monospace property sets the font-family to monospace.                          | `boolean` | `false`     |
| `sort`         | `sort`          | If present, the table will be pre-sorted by this column.                           | `string`  | `undefined` |
| `sortable`     | `sortable`      | If present, the column will be sortable. *For sorting dates use `sortable="date"`. | `string`  | `undefined` |
| `width`        | `width`         | The width property sets the column's width. All CSS length units are accepted.     | `string`  | `'auto'`    |


## Events

| Event     | Description                                                                                             | Type                  |
| --------- | ------------------------------------------------------------------------------------------------------- | --------------------- |
| `clicked` | Fired when clicking on content within a table cell for this column. Event detail contains the row data. | `CustomEvent<object>` |


----------------------------------------------


