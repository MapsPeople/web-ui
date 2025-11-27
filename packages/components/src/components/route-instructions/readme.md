# mi-route-instructions

The `<mi-route-instructions` element can be used to show route instructions given a MapsIndoors directions result.

Working example:

<mi-route-instructions></mi-route-instructions>

<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?v=3&key=AIzaSyBNhmxW2OntKAVs7hjxmAjFscioPcfWZSc&libraries=geometry,places">
</script>
<script type="text/javascript" src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.13.0/mapsindoors-4.13.0.js.gz?apikey=demo">
</script>
<script>
    const externalDirectionsProvider = new mapsindoors.directions.GoogleMapsProvider()
    const directionsServiceInstance = new mapsindoors.services.DirectionsService(externalDirectionsProvider);
    const routeInstructionsElement = document.querySelector('mi-route-instructions');

    const origin = { lat: 38.8936951, lng: -77.0160064 }; // Google Location
    const destination = { lat: 38.8977566, lng: -77.0367785, floor: 20 }; // Family Dining Room (MapsIndoors Location)
    const travelMode = 'TRANSIT';
    const avoidStairs = true;

    // Get route from MapsIndoors Directions Service
    directionsServiceInstance.getRoute({
            origin: origin,
            destination: destination,
            travelMode: travelMode,
            avoidStairs: avoidStairs
        }).then((route) => {
            // Set route object at mi-route-instructions element
            routeInstructionsElement.route = route;
            routeInstructionsElement.originName = 'My Origin Location';
        });

    // Populate destinationLocation property
    const familyDiningRoomId = '4e5b58daaa6f48f687e2de0f';
    mapsindoors.services.LocationsService.getLocation(familyDiningRoomId).then(location => {
            routeInstructionsElement.destinationLocation = location;
    });
</script>

Example usage:

```html
<!-- HTML -->

<mi-map-mapbox></mi-map-mapbox>
<mi-route-instructions></mi-route-instructions>
```

Get a route from a MapsIndoors map element eg. `<mi-map-mapbox>` and set the result as property on the `<mi-route-instructions>` element:

```js
// JavaScript

const mapElement = document.querySelector('mi-map-mapbox');
const routeInstructionsElement = document.querySelector('mi-route-instructions');

const origin = { lng: 9.909250, lat: 57.038939 };
const destination = { lat: 57.058230, lng: 9.951134, floor: 10 };
const travelMode = 'BICYCLING';

mapElement.showRoute({ origin, destination, travelMode }).then(() => {
    mapElement.getRoute().then(route => {
        routeInstructionsElement.route = route;
    });
});
```

or get a route from the [directionService](https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/DirectionsService.html) within the MapsIndoors JavaScript SDK:

```html
<!-- HTML -->

<mi-route-instructions></mi-route-instructions>
```

```js
// JavaScript

// Remember to initialize a map and MapsIndoors API with your API keys.

const externalDirectionsProvider = new mapsindoors.directions.GoogleMapsProvider()
const directionsServiceInstance = new mapsindoors.services.DirectionsService(externalDirectionsProvider);
const routeInstructionsElement = document.querySelector('mi-route-instructions');

const origin = { lat: 38.8936951, lng: -77.0160064 }; // C St NW, Washington, DC (Google Location)
const destination = { lat: 38.8977566, lng: -77.0367785, floor: 20 }; // Family Dining Room (MapsIndoors Location)
const travelMode = 'TRANSIT';
const avoidStairs = true;

// Get route from MapsIndoors Directions Service
directionsServiceInstance.getRoute({
    origin: origin,
    destination: destination,
    travelMode: travelMode,
    avoidStairs: avoidStairs
}).then((route) => {
    // Set route object at mi-route-instructions element
    routeInstructionsElement.route = route;
    routeInstructionsElement.originName = 'My Origin Location';
});

// Populate destinationLocation property
const familyDiningRoomId = '4e5b58daaa6f48f687e2de0f';
mapsindoors.services.LocationsService.getLocation(familyDiningRoomId).then(location => {
    routeInstructionsElement.destinationLocation = location;
});
```

## `clicked` event

A `clicked` event is emitted from within the `<mi-route-instructions>` element when the user clicks on a part of the route instructions. The event payload contains an object with information about the leg index, step index and manuever index that was clicked.

Example:

```js
// JavaScript

routeInstructionsElement.addEventListener('clicked', event => console.log('Instructions clicked', event.detail)); // { legIndex: 1, stepIndex: 2, manueverIndex: 3 }
```

## `activeStep` attribute

An `activeStep` attribute is available on the `<mi-route-instructions>` element which can be used to set and read the currently visually highlighting step. The active step gets updated internally but can be overwritten programmatically by using this attribute. The default values is { legIndex: 0, stepIndex: 0 }.

## `hideIndoorSubsteps` attribute

A `hideIndoorSubsteps` attribute is available on the `<mi-route-instructions>` element. Set this to `false` if indoors substeps should be visible. Default is `true`.

## `translations` attribute

A `translations` attribute is available on the `<mi-route-instructions>` element which can be used to pass a object of translations in preferred language. When set all labels will set using the translations. The property is optional but when setting it the whole object is required for the custom element to work properly. The default language is English.

Example usage:

```html
<!-- HTML -->

<mi-route-instructions></mi-route-instructions>
```

```js
// JavaScript

const translations = {
    walk: 'Gå',
    bike: 'Cykel',
    transit: 'Offentlig Transport',
    drive: 'Bil',
    ...
}
document.querySelector('mi-route-instructions').translations =  translations;
```

## `originLocation` attribute

A `originLocation` attribute is available on the `<mi-route-instructions>` element which can be used to set the origin location for presentation purpose. The `originLocation` attribute wins over the `originName` attribute when both is set.

## `originName` attribute

A `originName` attribute is available on the `<mi-route-instructions>` element which can be used to set the name of the origin location for presentation purpose. The origin name will not be rendered when the `originLocation` attribute is set.

## `destinationLocation` attribute

A `destinationLocation` attribute is available on the `<mi-route-instructions>` element which can be used to set the end location for presentation purpose. The `destinationLocation` attribute wins over the `destinationName` attribute when both is set.

## `destinationName` attribute

A `destinationName` attribute is available on the `<mi-route-instructions>` element which can be used to set the name of the end location for presentation purpose. The destination name will not be rendered when the `destinationLocation` attribute is set.

## `unit` attribute

A `unit` attribute is available on the `<mi-route-instructions>` element which can be used to control how distances are presented. Possible values are `metric` (which will show distances in meters and km) and `imperial` (which will show distances in feet and miles). Default value is `metric`.

## Styling

On [modern browsers](https://caniuse.com/?search=%3A%3Apart), parts of the component style can be overridden using the CSS pseudo element `::part`.

The following parts are available for styling:

- `step`: Styles the `mi-route-instructions-step` element.
- `active`: Styles the `mi-route-instructions-step` element when in a active state. The step element get populated with the "active" part when the `activeStep` attribute is set.

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

- `instructions-destination`: Styles the destination `div` element which contains the destination title.
- `instructions-destination-info`: Styles the `mi-location-info` element which contains destination details.

### Styling example

```css
/* CSS */

mi-route-instructions::part(instructions-destination) {
    color: #1a5130;
}
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property              | Attribute              | Description                                                                                                                                                                              | Type                                                                                                         | Default                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeStep`          | --                     | Set active step to populate it with an "active" class. Defaults to legIndex 0 and stepIndex 0.                                                                                           | `{ legIndex: number; stepIndex: number; }`                                                                   | `{         legIndex: 0,         stepIndex: 0     }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `destinationLocation` | --                     | If the end location is a MapsIndoors location, provide it to have the instructions present it. The destinationLocation attribute wins over the destinationName attribute.                | `Location`                                                                                                   | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `destinationName`     | `destination-name`     | If the end location is a external location, provide a name to have the instructions present it. The destination name will not be rendered when the destinationLocation attribute is set. | `string`                                                                                                     | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `hideIndoorSubsteps`  | `hide-indoor-substeps` | If indoor substeps/maneuvers should be hidden.                                                                                                                                           | `boolean`                                                                                                    | `false`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `originLocation`      | --                     | If the origin location is a MapsIndoors location, provide it to have the instructions present it. The originLocation attribute wins over the originName attribute.                       | `Location`                                                                                                   | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `originName`          | `origin-name`          | If the origin location is a external location, provide a name to have the instructions present it. The origin name will not be rendered when the originLocation attribute is set.        | `string`                                                                                                     | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `route`               | --                     | A MapsIndoors directions result object given from a getRoute call from DirectionsService.                                                                                                | `Route`                                                                                                      | `undefined`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `translations`        | --                     | Translations object for translatable labels.                                                                                                                                             | `DirectionsTranslations`                                                                                     | `{         walk: 'Walk',         bike: 'Bike',         transit: 'Transit',         drive: 'Drive',         leave: 'Leave',         from: 'From',         park: 'Park',         at: 'at',         building: 'Building',         venue: 'Venue',         takeStaircaseToLevel: 'Take staircase to level',         takeLadderToLevel: 'Take the ladder to level',         takeElevatorToLevel: 'Take elevator to level',         takeEscalatorToLevel: 'Take escalator to level',         takeWheelchairLiftToLevel: 'Take wheelchair lift to level',         takeWheelchairRampToLevel: 'Take wheelchair ramp to level',         exit: 'Exit',         enter: 'Enter',         stops: 'stops',         andContinue: 'and continue',         continueStraightAhead: 'Continue straight ahead',         goLeft: 'Go left',         goSharpLeft: 'Go sharp left',         goSlightLeft: 'Go slight left',         goRight: 'Go right',         goSharpRight: 'Go sharp right',         goSlightRight: 'Go slight right',         turnAround: 'Turn around',         days: 'd',         hours: 'h',         minutes: 'min',         rideTheBus: 'Ride the bus'     }` |
| `travelMode`          | `travel-mode`          | Set preferred travel mode. Defaults to "walking".                                                                                                                                        | `RouteTravelMode.Bicycling \| RouteTravelMode.Driving \| RouteTravelMode.Transit \| RouteTravelMode.Walking` | `RouteTravelMode.Walking`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `unit`                | `unit`                 | Set imperial or metric as default unit system.                                                                                                                                           | `UnitSystem.Imperial \| UnitSystem.Metric`                                                                   | `UnitSystem.Metric`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |


## Events

| Event     | Description                                  | Type                  |
| --------- | -------------------------------------------- | --------------------- |
| `clicked` | Event emitted when clicking on instructions. | `CustomEvent<object>` |


## Shadow Parts

| Part                              | Description |
| --------------------------------- | ----------- |
| `"instructions-destination"`      |             |
| `"instructions-destination-info"` |             |


----------------------------------------------


