# mi-route-instructions-heading (WIP)

<i>N.B. the travel mode and from selector is still work in progress.</i><br><br>
The `<mi-route-instructions-heading>` element can be used to display way points, route details and travel mode selector.

Working example:

<mi-route-instructions-heading
    style="display: block; width: 500px;"
    total-travel-time="1000"
    total-walking-distance="1000"
    travel-mode="walking">
</mi-route-instructions-heading>

<script>
    const headingElement = document.querySelector('mi-route-instructions-heading');
    headingElement.originName = 'My Position';
    headingElement.destinationName = 'Library, Level G';
</script>

Example usage:

```html
<!-- HTML -->

<mi-route-instructions-heading
    total-travel-time="1000"
    total-walking-distance="1000"
    travel-mode="walking">
</mi-route-instructions-heading>
```

```js
// Javascript

const headingElement = document.querySelector('mi-route-instructions-heading');
headingElement.originName = 'My Position';
headingElement.destinationName = 'Library, Level G';
```

## `originName` attribute

A `originName` attribute is available on the `<mi-route-instruction-heading>` element which should be used to set a origin location name. The attribute is required.

## `destinationName` attribute

A `destinationName` attribute is available on the `<mi-route-instruction-heading>` element which should be used to set a destination location name. The attribute is required.

## `totalTravelTime` attribute

A `totalTravelTime` attribute is available on the `<mi-route-instruction-heading>` element which can be used to set the total travel time in seconds.

## `totalWalkingDistance` attribute

A `totalWalkingDistance` attribute is available on the `<mi-route-instruction-heading>` element which can be used to set the total walking distance in meters.

## `travelMode` attribute

A `travelMode` attribute is available on the `<mi-route-instruction-heading>` element which can be used to set the preferred travelMode.

## `unit` attribute

A `unit` attribute is available on the `<mi-route-instruction-heading>` element which can be used to set the preferred unit.

## `translations` attribute

A `translations` attribute is available on the `<mi-route-instruction-heading>` element which can be used to pass a object of translations in preferred language. When set all labels will set using the translations. The default language is English.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                | Description                                        | Type                                                                                                                                                                | Default                                                                                                                                                                                                                                                                   |
| ---------------------- | ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `destinationName`      | `destination-name`       | The destination location name.                     | `string`                                                                                                                                                            | `undefined`                                                                                                                                                                                                                                                               |
| `originName`           | `origin-name`            | The origin location name.                          | `string`                                                                                                                                                            | `undefined`                                                                                                                                                                                                                                                               |
| `totalTravelTime`      | `total-travel-time`      | The total travel duration in seconds.              | `number`                                                                                                                                                            | `undefined`                                                                                                                                                                                                                                                               |
| `totalWalkingDistance` | `total-walking-distance` | The total walking distance in meters.              | `number`                                                                                                                                                            | `undefined`                                                                                                                                                                                                                                                               |
| `translations`         | --                       |                                                    | `{ from: string; to: string; avoidStairs: string; walk: string; walking: string; bike: string; bicycling: string; transit: string; car: string; driving: string; }` | `{         from: 'From',         to: 'To',         avoidStairs: 'Avoid stairs',         walk: 'Walk',         walking: 'Walking',         bike: 'Bike',         bicycling: 'Bicycling',         transit: 'Transit',         car: 'Car',         driving: 'Driving'     }` |
| `travelMode`           | `travel-mode`            | Set preferred travel mode. Defaults to "walking".  | `RouteTravelMode.Bicycling \| RouteTravelMode.Driving \| RouteTravelMode.Transit \| RouteTravelMode.Walking`                                                        | `RouteTravelMode.Walking`                                                                                                                                                                                                                                                 |
| `unit`                 | `unit`                   | Set 'imperial' or 'metric' as default unit system. | `UnitSystem.Imperial \| UnitSystem.Metric`                                                                                                                          | `UnitSystem.Metric`                                                                                                                                                                                                                                                       |


----------------------------------------------


