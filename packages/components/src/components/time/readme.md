# mi-time

The `<mi-time>` element can be used to display seconds as days, hours and minutes.

Working example:

<mi-time seconds="10000"></mi-time>

Example usage:

```html
<!-- HTML -->

<mi-time seconds="10000"></mi-time>
```

## `seconds` attribute

A `seconds` attribute is available on the `<mi-time>` element, which can be used to pass a value in seconds. When set a formatted string will be displayed in days, hours, and minutes. The minimum display value is 1 minute.

## `translations` attribute

A `translations` attribute is available on the `<mi-time>` element, which can be used to pass an object with translation strings as stringified JSON. The default translation is English.

Translation object should have translations for the following properties:

| Properties |
| ---------- |
| days       |
| hours      |
| minutes    |

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description                                                                                                        | Type     | Default     |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ----------- |
| `seconds`      | `seconds`      | Time in seconds.                                                                                                   | `number` | `undefined` |
| `translations` | `translations` | Object with translation strings as stringified JSON. Default translations {days: 'd', hours: 'h', minutes: 'min'}. | `string` | `undefined` |


----------------------------------------------


