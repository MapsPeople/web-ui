# mi-route-instructions-maneuver-legacy

The `<mi-route-instructions-maneuver-legacy` is used internally within the `<mi-route-instructions>` and `<mi-route-instructions-step` custom elements. The component shows a route instruction maneuver which consists of a maneuver icon, instruction and distance information.

Working example:

<mi-route-instructions-maneuver-legacy></mi-route-instructions-maneuver-legacy>
<script>
const maneuverElement = document.querySelector('mi-route-instructions-maneuver-legacy');

maneuverElement.translations = JSON.stringify({
    andContinue: 'and continue',
    continueStraightAhead: 'Continue straight ahead',
    goLeft: 'Go left',
    goSharpLeft: 'Go sharp left',
    goSlightLeft: 'Go slight left',
    goRight: 'Go right',
    goSharpRight: 'Go sharp right',
    goSlightRight: 'Go slight right',
    turnAround: 'Turn around'
});

maneuverElement.maneuver = JSON.stringify({
    maneuver: 'straight',
    distance: {
        value: 2
    }
});
</script>

Example usage:

```html
<!-- HTML -->

<mi-route-instructions-maneuver-legacy></mi-route-instructions-maneuver-legacy>
```

```js
// JavaScript

const maneuverElement = document.querySelector('mi-route-instructions-maneuver-legacy');

maneuverElement.translations = JSON.stringify({
    andContinue: 'and continue',
    continueStraightAhead: 'Continue straight ahead',
    goLeft: 'Go left',
    goSharpLeft: 'Go sharp left',
    goSlightLeft: 'Go slight left',
    goRight: 'Go right',
    goSharpRight: 'Go sharp right',
    goSlightRight: 'Go slight right',
    turnAround: 'Turn around'
});

maneuverElement.maneuver = JSON.stringify({
    maneuver: 'straight',
    distance: {
        value: 2
    }
});
```

## `maneuver` attribute

A `maneuver` attribute is available on the `<mi-route-instructions-maneuver-legacy>` element which can be used to pass a maneuver object as stringified JSON. When set a step will be displayed including a maneuver icon, instruction and distance information. The attribute is required.

## `translations` attribute

A `translations` attribute is available on the `<mi-route-instructions-maneuver-legacy>` element which can be used to pass a object with translation strings as stringified JSON. The attribute is required.

Translation object should have translations for the following properties:

| Properties            |
| --------------------- |
| andContinue           |
| continueStraightAhead |
| goLeft                |
| goSharpLeft           |
| goSlightLeft          |
| goRight               |
| goSharpRight          |
| goSlightRight         |
| turnAround            |

## `unit` attribute

A `unit` attribute is available on the `<mi-route-instructions-maneuver-legacy>` element which can be used to control how the distance presented. Possible values are `metric` (which will show distance in meters and km) and `imperial` (which will show distance in feet and miles). Default value is `metric`.

## Styling

On [modern browsers](https://caniuse.com/?search=%3A%3Apart), parts of the component style can be overridden using the CSS pseudo element `::part`.

The following parts are available for styling:

- `maneuver-icon`: Styles the `mi-icon` element which contains the maneuver icon.
- `maneuver-description`: Styles the paragraph element which contains the maneuver text.
- `maneuver-description-distance`: Styles the `mi-distance` element which contains the distance text.
- `maneuver-description-distance-border` Styles the `span` element which present the border.

### Styling example

```css
/* CSS */

mi-route-instructions-maneuver-legacy::part(maneuver-icon) {
    background-color: #1a5130;
}
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description                                          | Type                                       | Default             |
| -------------- | -------------- | ---------------------------------------------------- | ------------------------------------------ | ------------------- |
| `maneuver`     | `maneuver`     | Maneuver to display given as stringified JSON.       | `string`                                   | `undefined`         |
| `translations` | `translations` | Object with translation strings as stringified JSON. | `string`                                   | `undefined`         |
| `unit`         | `unit`         | Set imperial or metric as default unit system.       | `UnitSystem.Imperial \| UnitSystem.Metric` | `UnitSystem.Metric` |


## Shadow Parts

| Part                                     | Description |
| ---------------------------------------- | ----------- |
| `"maneuver-description"`                 |             |
| `"maneuver-description-distance"`        |             |
| `"maneuver-description-distance-border"` |             |
| `"maneuver-icon"`                        |             |


----------------------------------------------


