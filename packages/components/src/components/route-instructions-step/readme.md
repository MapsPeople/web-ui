# mi-route-instructions-step

The `<mi-route-instructions-step` element is used internally within the `<mi-route-instructions>` custom element, and shows route instructions for a MapsIndoors route step.

Working example:

<mi-route-instructions-step></mi-route-instructions-step>

<script>
const stepElement = document.querySelector('mi-route-instructions-step');
const step = {
     distance: {
        text: '',
        value: 24
    },
    duration: {
        text: '',
        value: 37
    },
    start_location: {
        floor_name: '0',
        lat: 57.0581246,
        lng: 9.9506587,
        zLevel: 0
    },
    end_location: {
        floor_name: '0',
        lat: 57.0580794,
        lng: 9.9504232,
        zLevel: 0
    },
    geometry: null,
    highway: 'footway',
    end_context: {
        building: {
            buildingInfo: {
                name: "The White House"
            }
        },
        venue: {
            venueInfo: {
                name: "The White House"
            }
        }
    },
    route_context: 'InsideBuilding',
    html_instructions: null,
    maneuver: null,
    travel_mode: 'WALKING',
    name: 'The White House',
    originalLegIndex: 0,
    originalStepIndex: 0,
    steps: [
        {
            distance: { text: '9 m', value: 9 },
            duration: { text: '0 mins', value: 6 },
            end_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
            geometry: { type: 'LineString', coordinates: Array(15) },
            highway: 'footway',
            html_instructions: null,
            maneuver: 'straight',
            route_context: 'InsideBuilding',
            start_location: { zLevel: 0, floor_name: '0', lat: 57.0580794, lng: 9.9504232 },
            travel_mode: 'WALKING'
        },
        {
            distance: { text: '3 m', value: 3 },
            duration: { text: '0 mins', value: 2 },
            end_location: { zLevel: 0, floor_name: '0', lat: 57.0581098, lng: 9.9505663 },
            geometry: { type: 'LineString', coordinates: Array(2) },
            highway: 'footway',
            html_instructions: null,
            maneuver: 'turn-right',
            route_context: 'InsideBuilding',
            start_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
            travel_mode: 'WALKING'
        }
    ]
}
const translations = {
    walk: 'Walk',
    bike: 'Bike',
    transit: 'Transit',
    drive: 'Drive',
    leave: 'Leave',
    from: 'From',
    park: 'Park',
    at: 'at',
    building: 'Building',
    venue: 'Venue',
    takeStaircaseToLevel: 'Take staircase to level',
    takeElevatorToLevel: 'Take elevator to level',
    takeEscalatorToLevel: 'Take escalator to level',
    exit: 'Exit',
    enter: 'Enter',
    stops: 'stops',
    andContinue: 'and continue',
    continueStraightAhead: 'Continue straight ahead',
    goLeft: 'Go left',
    goSharpLeft: 'Go sharp left',
    goSlightLeft: 'Go slight left',
    goRight: 'Go right',
    goSharpRight: 'Go sharp right',
    goSlightRight: 'Go slight right',
    turnAround: 'Turn around',
    days: 'd',
    hours: 'h',
    minutes: 'min'
}

stepElement.step = JSON.stringify(step);
stepElement.fromRouteContext = 'Outside';
stepElement.translations = JSON.stringify(translations);
stepElement.hideIndoorSubsteps = false;
</script>

Example usage:

```html
<!-- HTML -->

<mi-route-instructions-step></mi-route-instructions-step>
```

```js
// JavaScript

const stepElement = document.querySelector('mi-route-instructions-step');
const step = {
     distance: {
        text: '',
        value: 24
    },
    duration: {
        text: '',
        value: 37
    },
    start_location: {
        floor_name: '0',
        lat: 57.0581246,
        lng: 9.9506587,
        zLevel: 0
    },
    end_location: {
        floor_name: '0',
        lat: 57.0580794,
        lng: 9.9504232,
        zLevel: 0
    },
    geometry: null,
    highway: 'footway',
    end_context: {
        building: {
            buildingInfo: {
                name: "The White House"
            }
        },
        venue: {
            venueInfo: {
                name: "The White House"
            }
        }
    },
    route_context: 'InsideBuilding',
    html_instructions: null,
    maneuver: null,
    travel_mode: 'WALKING',
    name: 'The White House',
    originalLegIndex: 0,
    originalStepIndex: 0,
    steps: [
        {
            distance: { text: '9 m', value: 9 },
            duration: { text: '0 mins', value: 6 },
            end_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
            geometry: { type: 'LineString', coordinates: Array(15) },
            highway: 'footway',
            html_instructions: null,
            maneuver: 'straight',
            route_context: 'InsideBuilding',
            start_location: { zLevel: 0, floor_name: '0', lat: 57.0580794, lng: 9.9504232 },
            travel_mode: 'WALKING'
        },
        {
            distance: { text: '3 m', value: 3 },
            duration: { text: '0 mins', value: 2 },
            end_location: { zLevel: 0, floor_name: '0', lat: 57.0581098, lng: 9.9505663 },
            geometry: { type: 'LineString', coordinates: Array(2) },
            highway: 'footway',
            html_instructions: null,
            maneuver: 'turn-right',
            route_context: 'InsideBuilding',
            start_location: { zLevel: 0, floor_name: '0', lat: 57.0581288, lng: 9.9505383 },
            travel_mode: 'WALKING'
        }
    ]
}
const translations = {
    walk: 'Walk',
    bike: 'Bike',
    transit: 'Transit',
    drive: 'Drive',
    leave: 'Leave',
    from: 'From',
    park: 'Park',
    at: 'at',
    building: 'Building',
    venue: 'Venue',
    takeStaircaseToLevel: 'Take staircase to level',
    takeElevatorToLevel: 'Take elevator to level',
    exit: 'Exit',
    enter: 'Enter',
    stops: 'stops',
    andContinue: 'and continue',
    continueStraightAhead: 'Continue straight ahead',
    goLeft: 'Go left',
    goSharpLeft: 'Go sharp left',
    goSlightLeft: 'Go slight left',
    goRight: 'Go right',
    goSharpRight: 'Go sharp right',
    goSlightRight: 'Go slight right',
    turnAround: 'Turn around',
    days: 'd',
    hours: 'h',
    minutes: 'min'
}

stepElement.step = JSON.stringify(step);
stepElement.fromRouteContext = 'Outside';
stepElement.translations = JSON.stringify(translations);
stepElement.hideIndoorSubsteps = false;

```

## `step` attribute

A `step` attribute is available on the `<mi-route-instructions-step>` element which can be used to pass the step object as stringified JSON. The attribute is required.

## `hideIndoorSubsteps` attribute

A `hideIndoorSubsteps` attribute is available on the `<mi-route-instructions-step>` element. Set this to `false` if indoors substeps should be visible. Default is `true`.

## `fromRouteContext` attribute

A `fromRouteContext` attribute is available on the `<mi-route-instructions-step>` element which can be used to pass the route context of the previous step.

## `fromTravelMode` attribute

A `fromTravelMode` attribute is available on the `<mi-route-instructions-step>` element which can be used to pass the travel mode of the previous step.

## `fromRouteContext` attribute

A `fromRouteContext` attribute is available on the `<mi-route-instructions-step>` element which can be used to pass the transit stop of previous step.

## `translations` attribute

A `translations` attribute is available on the `<mi-route-instructions-step>` element which can be used to pass a object with translation strings as stringified JSON. The attribute is required.

Translation object should have translations for the following properties:

| Properties            |
| --------------------- |
| walk                  |
| bike                  |
| transit               |
| drive                 |
| leave                 |
| from                  |
| park                  |
| at                    |
| building              |
| venue                 |
| takeStaircaseToLevel  |
| takeElevatorToLevel   |
| exit                  |
| enter                 |
| stops                 |
| rideTheBus            |
| arrive                |
| andContinue           |
| continueStraightAhead |
| goLeft                |
| goSharpLeft           |
| goSlightLeft          |
| goRight               |
| goSharpRight          |
| goSlightRight         |
| turnAround            |
| days                  |
| hours                 |
| minutes               |

## `unit` attribute

A `unit` attribute is available on the `<mi-route-instructions-step>` element which can be used to control how distances are presented. Possible values are `metric` (which will show distances in meters and km) and `imperial` (which will show distances in feet and miles). Default value is `metric`.

## `stepClicked` event

A `stepClicked` event is emitted from the `<mi-route-instructions-step>` element when clicked.
The event includes the following information: legIndex, stepIndex and maneuverIndex.
The maneuverIndex is null unless the click was made directly on a maneuver.

Example:

```js
// JavaScript

const stepElement = document.querySelector('mi-route-instructions-step');
stepElement.addEventListener('stepClicked', event => console.log(event.detail));
// Expected output: { legIndex: 0; stepIndex: 2; maneuverIndex: 2; }
```

## Styling

On [modern browsers](https://caniuse.com/?search=%3A%3Apart), parts of the component style can be overridden using the CSS pseudo element `::part`.

The following parts are available for styling:

- `step-travel-mode`: Styles the travel mode area which contains the dotted border.
- `step-travel-mode-icon`: Styles the `mi-icon` element which contains the travel mode icon.
- `step-heading`: Styles the step heading element.
- `step-description`: Styles the step description area.
- `step-info`: Styles the step time and distance info.
- `step-toggle`: Styles the `mi-icon` element which contains the toggle icon.

- `maneuver-icon`: Styles the `mi-icon` element which contains the maneuver icon.
- `maneuver-description`: Styles the paragraph element which contains the maneuver text.
- `maneuver-description-distance`: Styles the `mi-distance` element which contains the distance text.
- `maneuver-description-distance-border` Styles the `span` element which present the border.

### Styling example

```css
/* CSS */

mi-route-instructions-step::part(step-toggle) {
    background-color: #1a5130;
}
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property             | Attribute              | Description                                                                                                                       | Type                                       | Default                                                                    |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `fromRouteContext`   | `from-route-context`   | The route context of previous step, if any.                                                                                       | `string`                                   | `''`                                                                       |
| `fromTransitStop`    | `from-transit-stop`    | The transit stop of previous step if any.                                                                                         | `string`                                   | `undefined`                                                                |
| `fromTravelMode`     | `from-travel-mode`     | The travel mode of previous step, if any.                                                                                         | `string`                                   | `undefined`                                                                |
| `hideIndoorSubsteps` | `hide-indoor-substeps` | If indoor substeps/maneuvers should be hidden.                                                                                    | `boolean`                                  | `true`                                                                     |
| `showToggleButton`   | `show-toggle-button`   | Indicates if it should show the toggle button.                                                                                    | `boolean`                                  | `true`                                                                     |
| `step`               | `step`                 | The step data object to render from. Must be passed as stringified JSON.                                                          | `string`                                   | `undefined`                                                                |
| `translations`       | `translations`         | Object with translation strings as stringified JSON.                                                                              | `string`                                   | `undefined`                                                                |
| `unit`               | `unit`                 | Set imperial or metric as default unit system. Default is Metric unless the browser is running US English. In that case Imperial. | `UnitSystem.Imperial \| UnitSystem.Metric` | `navigator.language === 'en-US' ? UnitSystem.Imperial : UnitSystem.Metric` |


## Events

| Event             | Description                                           | Type                  |
| ----------------- | ----------------------------------------------------- | --------------------- |
| `stepClicked`     | Event emitted when clicking on a step (not sub step). | `CustomEvent<object>` |
| `substepsToggled` | Event emitted when substeps are toggled.              | `CustomEvent<void>`   |


## Methods

### `closeSubsteps() => Promise<void>`

Programmatically close the substeps.

#### Returns

Type: `Promise<void>`



### `openSubsteps() => Promise<void>`

Programmatically open the substeps.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part                      | Description |
| ------------------------- | ----------- |
| `"step-description"`      |             |
| `"step-heading"`          |             |
| `"step-info"`             |             |
| `"step-toggle"`           |             |
| `"step-travel-mode"`      |             |
| `"step-travel-mode-icon"` |             |


----------------------------------------------


