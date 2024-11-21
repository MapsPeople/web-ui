# mi-scroll-buttons

The `<mi-scroll-buttons>` element can be used to show clickable scroll buttons for a scrollable element.

Working example:

<section style="display: flex;">
    <div id="scroll-container" style="width:400px; height:200px; overflow-y: scroll; color: dimgray;">
        <p>
            <i>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum recusandae quo ipsa soluta at numquam exercitationem odio qui, fugiat hic quibusdam sit suscipit ea necessitatibus harum eum atque. Aspernatur, tempora.
                Voluptas, sapiente tempore quaerat, architecto cupiditate vel ipsam nostrum amet labore illo delectus porro magnam. Accusantium voluptatum harum explicabo odit commodi praesentium ab nemo aut ea dolorum? Molestiae, laudantium repellat.
                Ipsam explicabo officiis vero veniam unde labore impedit culpa consequatur a eius alias, harum nemo laudantium nostrum. Saepe quaerat voluptates ut nostrum totam harum, minima adipisci, suscipit, expedita incidunt velit.
            <i/>
        </p>
    </div>
    <mi-scroll-buttons></mi-scroll-buttons>
</section>

<script>
    const scrollContainerElement = document.getElementById('scroll-container');
    const miScrollButtonsElement = document.querySelector('mi-scroll-buttons');

    miScrollButtonsElement.scrollContainerElementRef = scrollContainerElement;
</script>

Example usage:

```html
<!-- HTML -->

<section style="display: flex;">
    <div id="scroll-container" style="width:400px; height:200px; overflow-y: scroll; color: dimgray;">
        <p>
            <i>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum recusandae quo ipsa soluta at numquam exercitationem odio qui, fugiat hic quibusdam sit suscipit ea necessitatibus harum eum atque. Aspernatur, tempora.
                Voluptas, sapiente tempore quaerat, architecto cupiditate vel ipsam nostrum amet labore illo delectus porro magnam. Accusantium voluptatum harum explicabo odit commodi praesentium ab nemo aut ea dolorum? Molestiae, laudantium repellat.
                Ipsam explicabo officiis vero veniam unde labore impedit culpa consequatur a eius alias, harum nemo laudantium nostrum. Saepe quaerat voluptates ut nostrum totam harum, minima adipisci, suscipit, expedita incidunt velit.
            </i>
        </p>
    </div>
    <mi-scroll-buttons></mi-scroll-buttons>
</section>
```

```js
// JavaScript

const scrollContainerElement = document.getElementById('scroll-container');
const miScrollButtonsElement = document.querySelector('mi-scroll-buttons');

miScrollButtonsElement.scrollContainerElementRef = scrollContainerElement;
```

## `scrollContainerElementRef` attribute

A `scrollContainerElementRef` attribute is available on the `<mi-scroll-buttons>` element which should be used to reference the scrollable element. The attribute is required.

## `scrollLength` attribute

A `scrollLength` attribute is available on the `<mi-scroll-buttons>` element which can be used to define the length in pixels to scroll on the referenced scrollable element. The default value is 100.

## `updateScrollButtonsState` method

A `updateScrollButtonsState` method can be called on the `<mi-scroll-buttons>` element to programatically update the state of the scroll buttons.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property                    | Attribute       | Description                                                                          | Type             | Default     |
| --------------------------- | --------------- | ------------------------------------------------------------------------------------ | ---------------- | ----------- |
| `scrollContainerElementRef` | --              | Reference to the element with scroll on parent element.                              | `HTMLDivElement` | `undefined` |
| `scrollLength`              | `scroll-length` | Determines how far to scroll when clicking one of the buttons. Default value is 100. | `number`         | `100`       |


## Methods

### `updateScrollButtons() => Promise<any>`

Update scroll buttons enabled/disabled states.

#### Returns

Type: `Promise<any>`



### `updateScrollButtonsState() => Promise<void>`

Updates enable/disable state for scroll up and down buttons.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part            | Description |
| --------------- | ----------- |
| `"button"`      |             |
| `"button-down"` |             |
| `"button-up"`   |             |
| `"container"`   |             |


----------------------------------------------


