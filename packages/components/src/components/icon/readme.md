# mi-icon

The `<mi-icon>` element can be used to display an icon. The icon scales to fit the host elements size which means a width and height should be defined for the element. Please note that this component is not compatible with Internet Explorer.

Working example:

<mi-icon icon-name="bike" style="display: block; width: 100px; height: 100px; background-color: blue;"></mi-icon>

Example usage:

```html
<!-- HTML -->

<mi-icon class="icon" icon-name="bike"></mi-icon>
```

```css
/* CSS */

.icon {
    width: 100px;
    height: 100px;
    background-color: blue;
}
```

## `icon-name` attribute

A `icon-name` attribute is available on the `<mi-icon>` element, which should be used to specify the icon. The attribute is required.

Supported icons:

| Icon Name          | Description            | Preview                                                                              |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------ |
| toggle             | A toggle icon          | <mi-icon icon-name="toggle" style="width: 24px; height: 24px"></mi-icon>             |
| printer            | A printer icon         | <mi-icon icon-name="printer" style="width: 24px; height: 24px"></mi-icon>            |
| circle             | A empty circle icon    | <mi-icon icon-name="circle" style="width: 24px; height: 24px"></mi-icon>             |
| marker             | A marker icon          | <mi-icon icon-name="marker" style="width: 24px; height: 24px"></mi-icon>             |
| walk               | A walking icon         | <mi-icon icon-name="walk" style="width: 24px; height: 24px"></mi-icon>               |
| bike               | A bicycling icon       | <mi-icon icon-name="bike" style="width: 24px; height: 24px"></mi-icon>               |
| boat               | A boat icon            | <mi-icon icon-name="boat" style="width: 24px; height: 24px"></mi-icon>               |
| bus                | A bus icon             | <mi-icon icon-name="bus" style="width: 24px; height: 24px"></mi-icon>                |
| railway            | A railway icon         | <mi-icon icon-name="railway" style="width: 24px; height: 24px"></mi-icon>            |
| train              | A train icon           | <mi-icon icon-name="train" style="width: 24px; height: 24px"></mi-icon>              |
| subway             | A subway icon          | <mi-icon icon-name="subway" style="width: 24px; height: 24px"></mi-icon>             |
| transit            | A transit icon         | <mi-icon icon-name="transit" style="width: 24px; height: 24px"></mi-icon>            |
| car                | A driving icon         | <mi-icon icon-name="car" style="width: 24px; height: 24px"></mi-icon>                |
| transit-stop       | A transit stop icon    | <mi-icon icon-name="transit-stop" style="width: 24px; height: 24px"></mi-icon>       |
| park               | A parking icon         | <mi-icon icon-name="park" style="width: 24px; height: 24px"></mi-icon>               |
| elevator           | A elevator icon        | <mi-icon icon-name="elevator" style="width: 24px; height: 24px"></mi-icon>           |
| stairs             | A stairs icon          | <mi-icon icon-name="stairs" style="width: 24px; height: 24px"></mi-icon>             |
| ladder             | A ladder icon          | <mi-icon icon-name="ladder" style="width: 24px; height: 24px"></mi-icon>             |
| wheelchair-ramp    | A wheelchair ramp icon | <mi-icon icon-name="wheelchair-ramp" style="width: 24px; height: 24px"></mi-icon>    |
| wheeldhair-lift    | A wheelchair lift icon | <mi-icon icon-name="wheelchair-lift" style="width: 24px; height: 24px"></mi-icon>    |
| depart             | A navigation icon      | <mi-icon icon-name="depart" style="width: 24px; height: 24px"></mi-icon>             |
| arrow-straight     | A navigation icon      | <mi-icon icon-name="arrow-straight" style="width: 24px; height: 24px"></mi-icon>     |
| arrow-sharp-right  | A navigation icon      | <mi-icon icon-name="arrow-sharp-right" style="width: 24px; height: 24px"></mi-icon>  |
| arrow-sharp-left   | A navigation icon      | <mi-icon icon-name="arrow-sharp-left" style="width: 24px; height: 24px"></mi-icon>   |
| arrow-slight-right | A navigation icon      | <mi-icon icon-name="arrow-slight-right" style="width: 24px; height: 24px"></mi-icon> |
| arrow-slight-left  | A navigation icon      | <mi-icon icon-name="arrow-slight-left" style="width: 24px; height: 24px"></mi-icon>  |
| arrow-right        | A navigation icon      | <mi-icon icon-name="arrow-right" style="width: 24px; height: 24px"></mi-icon>        |
| arrow-left         | A navigation icon      | <mi-icon icon-name="arrow-left" style="width: 24px; height: 24px"></mi-icon>         |
| arrow-u-turn       | A navigation icon      | <mi-icon icon-name="arrow-u-turn" style="width: 24px; height: 24px"></mi-icon>       |

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                                 | Type     | Default     |
| ---------- | ----------- | --------------------------------------------------------------------------- | -------- | ----------- |
| `iconName` | `icon-name` | The icon name. A list of supported icons can be found in the documentation. | `string` | `undefined` |


----------------------------------------------


