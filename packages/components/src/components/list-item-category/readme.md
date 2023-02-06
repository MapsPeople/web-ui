# mi-list-item-category

## `category` attribute

## `orientation` attribute

The `orientation` attribute specifies the list orientation.
It defaults to `vertical` but accepts the following values:

* `vertical`
* `horizontal`

Example:

```html
<mi-list-item-category orientation="horizontal"></mi-list-item-category>
```

When using the `horizontal` variant, define a `width` and `height` for the `<mi-list-item-category>` element to get a nice and horizontal list.

Styling example:

```html
<mi-list>
<mi-list-item-category orientation="horizontal"></mi-list-item-category>
</mi-list>
```

```css
mi-list mi-list-item-category {
width: 20%;
height: 128px;
}

@media only screen and (max-width: 600px) {
mi-list mi-list-item-category {
width: 50%;
}
}
```

## `categoryClicked` EventEmitter

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type     | Default      |
| ------------- | ------------- | ----------- | -------- | ------------ |
| `category`    | `category`    |             | `any`    | `undefined`  |
| `orientation` | `orientation` |             | `string` | `'vertical'` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `categoryClicked`   |             | `CustomEvent<any>` |
| `listItemDidRender` |             | `CustomEvent<any>` |


----------------------------------------------


