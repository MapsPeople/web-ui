# mi-data-table

The `<mi-data-table>` element can be used to display a styled table given an array of objects and usage of the `<mi-column>` element.

Working example:

<label for="pageNumber">
    Specify which page/section of rows to show:
    <input id="pageNumber" type="number" value="1">
</label>

<mi-data-table selectable>
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

let pageToShow = 1;

document.querySelector('mi-data-table').rows = tableData;
document.querySelector('mi-data-table').maxRows = 2;
document.querySelector('mi-data-table').page = pageToShow;

document.getElementById('button-column').addEventListener('clicked', event => alert(event.detail.title));
document.getElementById('pageNumber').addEventListener('input', event => {
    pageToShow = event.target.value;
    document.querySelector('mi-data-table').page = pageToShow;
});
</script>

Example usage:

```html
<!-- HTML -->
<label for="pageNumber">
    Specify which page/section of rows to show:
    <input id="pageNumber" type="number" value="1">
</label>
<mi-data-table selectable>
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

let pageToShow = 1;

document.querySelector('mi-data-table').rows = tableData;
document.querySelector('mi-data-table').maxRows = 2;
document.querySelector('mi-data-table').page = pageToShow;

document.getElementById('button-column').addEventListener('clicked', event => alert(event.detail.title));
document.getElementById('pageNumber').addEventListener('input', event => {
    pageToShow = event.target.value;
    document.querySelector('mi-data-table').page = pageToShow;
});
```

## `rows` attribute

A `rows` attribute is available on the `<mi-data-table>` element, where you set the array with data to present in the table.

## `selectable` attribute

A `selectable` attribute is available on the `<mi-data-table>` element. When present the first column in the table will be checkboxes. The checkbox in the header is a select all or none checkbox. It is possible to get the selected rows from the `selected` property on the table.

## `page` attribute

A `page` attribute is available on the `<mi-data-table>` element, which can be used to set which page of rows to show. When using the `<mi-data-table>` with pagination and the maxRows is set to be less the total number of rows, the page property can specify which chunk of rows to show.

## `maxRows` attribute

A `maxRows` attribute is available on the `<mi-data-table>` element, which can be used to set the upper limit of rows to show in the table.

## `emptyPageHeader` attribute

An `emptyPageHeader` attribute is available on the `<mi-data-table>` element which can be used to set the header that is being presented when the table is empty.

## `emptyPageSubheader` attribute

An `emptyPageSubheader` attribute is available on the `<mi-data-table>` element which can be used to set the subheader that is being presented when the table is empty.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description                                                                                                                                                 | Type       | Default              |
| -------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------- |
| `emptyPageHeader`    | `empty-page-header`    | Guiding message when presented with a table that has no rows.                                                                                               | `string`   | `'No results found'` |
| `emptyPageSubheader` | `empty-page-subheader` | Guiding message for actionable steps to be performed in order to render new search results.                                                                 | `string`   | `undefined`          |
| `isHeaderSticky`     | `sticky-header`        | Whether or not the table header should be sticky.                                                                                                           | `boolean`  | `true`               |
| `maxRows`            | `max-rows`             | The maximum number of rows to be displayed.                                                                                                                 | `number`   | `undefined`          |
| `page`               | `page`                 | The page of rows to be displayed. Eg. If the maxRows is set to be less the total number of rows, the page property can specify which chunk of rows to show. | `number`   | `undefined`          |
| `rows`               | --                     | Array of objects for each row in the table.                                                                                                                 | `any[]`    | `[]`                 |
| `selectable`         | `selectable`           | The selectable attribute specifies whether the first column in the table should be checkboxes. The header will be a select all or none checkbox.            | `boolean`  | `false`              |
| `selected`           | --                     | The selected property contains a Set of all selected rows. This property is only relevant if the selectable attribute is present.                           | `Set<any>` | `new Set()`          |


## Events

| Event              | Description                                                                                                                                               | Type                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `selectionChanged` | Fired when selection of rows is changed. Event detail contains all the selected rows. This event is only relevant if the selectable attribute is present. | `CustomEvent<object>` |


----------------------------------------------


