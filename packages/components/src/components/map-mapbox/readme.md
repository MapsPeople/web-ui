# mi-map-mapbox

The `<mi-map-mapbox>` element can be used to display and interact with MapsIndoors and Mapbox.

Working example:

<mi-map-mapbox
    style="width: 600px; height: 400px;"
    access-token="pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg"
    mi-api-key="demo"
    floor-selector-control-position="top-right"
    my-position-control-position="top-right">
</mi-map-mapbox>

<button onclick="previousStep()">Previous Step</button>
<button onclick="nextStep()">Next Step</button>

<script>
    const miMapElement = document.querySelector('mi-map-mapbox');
    let miDirectionsServiceInstance;
    let miDirectionsRendererInstance;

    miMapElement.addEventListener('mapsIndoorsReady', () => {
        miMapElement.getDirectionsServiceInstance().then((directionsServiceInstance) => miDirectionsServiceInstance = directionsServiceInstance);
        miMapElement.getDirectionsRendererInstance().then((directionsRendererInstance) => miDirectionsRendererInstance = directionsRendererInstance);

        miMapElement.getMapInstance().then((mapInstance) => {
            mapInstance.setCenter({ lat: 38.8974905, lng: -77.0362723 }); // The White House
        });
        miMapElement.getMapsIndoorsInstance().then((mapsIndoorsInstance) => {
            mapsIndoorsInstance.addListener('click', (location) => this.setRoute(location));
        });
    })

    function getAnchorCoordinates(location) {
        return location.geometry.type.toLowerCase() === 'point' ?
            { lat: location.geometry.coordinates[1], lng: location.geometry.coordinates[0] } :
            { lat: location.properties.anchor.coordinates[1], lng: location.properties.anchor.coordinates[0] };
    }

    function setRoute(destination) {
        const destCoordinates = getAnchorCoordinates(destination);
        const routeParams = {
            origin: { lat: 38.8956311, lng: -77.0395035, floor: 0 }, // Coordinate near The White House
            destination: { lat: destCoordinates.lat, lng: destCoordinates.lng, floor: destination.properties.floor },
            travelMode: 'WALKING',
        };

        miDirectionsServiceInstance.getRoute(routeParams)
            .then(directionsResult => miDirectionsRendererInstance.setRoute(directionsResult));
    }

    function nextStep() {
        miDirectionsRendererInstance.nextStep();
    };

    function previousStep() {
        miDirectionsRendererInstance.previousStep();
    };
</script>

Example usage:

```html
<!-- HTML -->

<mi-map-mapbox
    style="width: 600px; height: 400px;"
    access-token="pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg"
    mi-api-key="demo"
    floor-selector-control-position="top-right"
    my-position-control-position="top-right">
</mi-map-mapbox>

<button onclick="previousStep()">Previous Step</button>
<button onclick="nextStep()">Next Step</button>
```

```js
// JavaScript

const miMapElement = document.querySelector('mi-map-mapbox');
let miDirectionsServiceInstance;
let miDirectionsRendererInstance;

miMapElement.addEventListener('mapsIndoorsReady', () => {
    miMapElement.getDirectionsServiceInstance().then((directionsServiceInstance) => miDirectionsServiceInstance = directionsServiceInstance);
    miMapElement.getDirectionsRendererInstance().then((directionsRendererInstance) => miDirectionsRendererInstance = directionsRendererInstance);

    miMapElement.getMapInstance().then((mapInstance) => {
        mapInstance.setCenter({ lat: 38.8974905, lng: -77.0362723 }); // The White House
    });

    miMapElement.getMapsIndoorsInstance().then((mapsIndoorsInstance) => {
        mapsIndoorsInstance.addListener('click', (location) => setRoute(location));
    });
})

function getAnchorCoordinates(location) {
    return location.geometry.type.toLowerCase() === 'point' ?
        { lat: location.geometry.coordinates[1], lng: location.geometry.coordinates[0] } :
        { lat: location.properties.anchor.coordinates[1], lng: location.properties.anchor.coordinates[0] };
}

function setRoute(destination) {
    const destCoordinates = getAnchorCoordinates(destination);
    const routeParams = {
        origin: { lat: 38.8956311, lng: -77.0395035, floor: 0 }, // Coordinate near The White House
        destination: { lat: destCoordinates.lat, lng: destCoordinates.lng, floor: destination.properties.floor },
        travelMode: 'WALKING',
    };

    miDirectionsServiceInstance.getRoute(routeParams)
        .then(directionsResult => miDirectionsRendererInstance.setRoute(directionsResult));
}

function nextStep() {
    miDirectionsRendererInstance.nextStep();
};

function previousStep() {
    miDirectionsRendererInstance.previousStep();
};
```

## `accessToken` attribute

A `accessToken` attribute is available on the `<mi-map-mapbox>` element, which should be used to set the Mapbox access token. The attribute is required.

## `miApiKey` attribute

A `miApiKey` attribute is available on the `<mi-map-mapbox>` element, which should be used to set the MapsIndoors API-Key. The attribute is required for the component to automatically insert and initialize the MapsIndoors JS SDK in the DOM.

## `disableExternalLinks` attribute

A `disableExternalLinks` attribute is available on the `<mi-map-mapbox>` element, which can be set to `true` to prevent external links on the map from opening. This can be useful when running the map on a kiosk where you never want the browser to navigate away.

## `floorSelectorControlPosition` attribute

A `floorSelectorControlPosition` attribute is available on the `<mi-map-mapbox>` element, which can be used to control where and if the Floor Selector should be rendered.

## `floorIndex` attribute

A `floorIndex` attribute is available on the `<mi-map-mapbox>` element, which can be used to set or get the current floor index.

## `myPositionControlPosition` attribute

A `myPositionControlPosition` attribute is available on the `<mi-map-mapbox>` element, which can be used to control where and if the Position Control should be rendered.

## `polygonHighlightOptions` attribute

A `polygonHighlightOptions` attribute is available on the `<mi-map-mapbox>` element, which can be used to control if and how locations should be highlighted. Set attribute to null to disable highlighting.

## `polylineOptions` attribute

A `polylineOptions` attribute is available on the `<mi-map-mapbox>` element, which can be used to style how the polyline looks when getting a route.

## `zoom` attribute

A `zoom` attribute is available on the `<mi-map-mapbox>` element, which can be used to set or get the current zoom level of the map.

## `maxZoom` attribute

A `maxZoom` attribute is available on the `<mi-map-mapbox>` element, which can be used to set or get the max zoom level of the map.

## `bearing` attribute

A `bearing` attribute is available on the `<mi-map-mapbox>` element, which can be used to set or get the current bearing of the map.

## `pitch` attribute

A `pitch` attribute is available on the `<mi-map-mapbox>` element, which can be used to set or get the current pitch of the map.

## `language` attribute

A `language` attribute is available on the `<mi-map-mapbox>` element, which can be used to set the component language. This attribute will not react to changes. Default is set to English (en).

## `mapsIndoorsReady` event

A `mapsIndoorsReady` event is emitted from the `<mi-map-mapbox>` element when MapsIndoors is ready.

## `getMapInstance` method

A `getMapInstance` method is available on the `<mi-map-mapbox>` element, which can be used to get the Google Maps instance.

## `getMapsIndoorsInstance` method

A `getMapsIndoorsInstance` method is available on the `<mi-map-mapbox>` element, which can be used to get the MapsIndoors instance.

## `getDirectionsServiceInstance` method

A `getDirectionsServiceInstance` method is available on the `<mi-map-mapbox>` element, which can be used to get the MapsIndoors DirectionsService Instance.

See the `DirectionsService` class here:
<https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.DirectionsService.html>

## `getDirectionsRendererInstance` method

A `getDirectionsRendererInstance` method is available on the `<mi-map-mapbox>` element, which can be used to get the MapsIndoors DirectionsRenderer Instance.

See the `DirectionsRenderer` class here:
<https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html>

## `highlightLocation` method

A `highlightLocation` method is available on the `<mi-map-mapbox>` element, which can be used to highlight a single MapsIndoors location. The method accepts a MapsIndoors location object. The highlight options can set at the `polygonHighlightOptions` attribute.

## `clearHighlightLocation` method

A `clearHighlightLocation` method is available on the `<mi-map-mapbox>` element, which can be used to dismiss an already existing MapsIndoors location highlight.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property                       | Attribute                         | Description                                                                                                                                                                                                                                                                                                                                                   | Type                                                                                                            | Default                                                                                                                                             |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accessToken`                  | `access-token`                    | The MapBox access token.                                                                                                                                                                                                                                                                                                                                      | `string`                                                                                                        | `undefined`                                                                                                                                         |
| `bearing`                      | `bearing`                         | Set or get the bearing of the map.                                                                                                                                                                                                                                                                                                                            | `string`                                                                                                        | `'0'`                                                                                                                                               |
| `disableExternalLinks`         | `disable-external-links`          | Set to true to prevent external links on the map from opening. This can be useful when running the map on a kiosk where you never want the browser to navigate away.                                                                                                                                                                                          | `boolean`                                                                                                       | `false`                                                                                                                                             |
| `floorIndex`                   | `floor-index`                     | Set or get the current floor index shown on the map.                                                                                                                                                                                                                                                                                                          | `string`                                                                                                        | `undefined`                                                                                                                                         |
| `floorSelectorControlPosition` | `floor-selector-control-position` | Render the floor selector as a Map Control at the given position.                                                                                                                                                                                                                                                                                             | `"bottom-left" \| "bottom-right" \| "top-left" \| "top-right"`                                                  | `undefined`                                                                                                                                         |
| `language`                     | `language`                        | Set the component language. Default set to English (en). Will not react to changes.                                                                                                                                                                                                                                                                           | `string`                                                                                                        | `'en'`                                                                                                                                              |
| `maxPitch`                     | `max-pitch`                       | Set or get the max pitch of the map (0-85).                                                                                                                                                                                                                                                                                                                   | `number`                                                                                                        | `60`                                                                                                                                                |
| `maxZoom`                      | `max-zoom`                        | Set or get the max zoom level of the map.                                                                                                                                                                                                                                                                                                                     | `string`                                                                                                        | `undefined`                                                                                                                                         |
| `miApiKey`                     | `mi-api-key`                      | The MapsIndoors API key.                                                                                                                                                                                                                                                                                                                                      | `string`                                                                                                        | `''`                                                                                                                                                |
| `myPositionControlPosition`    | `my-position-control-position`    | Render the My Position Control as a Map Control at the given position.                                                                                                                                                                                                                                                                                        | `"bottom-left" \| "bottom-right" \| "top-left" \| "top-right"`                                                  | `undefined`                                                                                                                                         |
| `pitch`                        | `pitch`                           | Set or get the pitch (tilt) of the map. Measured in degrees (0-60).                                                                                                                                                                                                                                                                                           | `string`                                                                                                        | `'0'`                                                                                                                                               |
| `polygonHighlightOptions`      | --                                | Styling of polygon highlight when a location is clicked. Set it to null to turn off highlighting.                                                                                                                                                                                                                                                             | `{ strokeColor: string; strokeOpacity: number; strokeWeight: number; fillColor: string; fillOpacity: number; }` | `{         strokeColor: '#EF6CCE',         strokeOpacity: 1,         strokeWeight: 2,         fillColor: '#EF6CCE',         fillOpacity: 0.2     }` |
| `polylineOptions`              | --                                | Styling of how the polyline looks when getting a route. Color: The stroke color of direction polyline on the map. Accepts any legal HTML color value. Default: '#307ad9'. Opacity: The stroke opacity of directions polylines on the map. Numerical value between 0.0 and 1.0. Default: 1. Weight: The width of the direction polyline in pixels. Default: 4. | `{ color: string; weight: number; opacity: number; }`                                                           | `{         color: '#3071d9',         opacity: 1,         weight: 4     }`                                                                           |
| `zoom`                         | `zoom`                            | Set or get the current zoom level of the map.                                                                                                                                                                                                                                                                                                                 | `string`                                                                                                        | `'17'`                                                                                                                                              |


## Events

| Event              | Description                                                                 | Type               |
| ------------------ | --------------------------------------------------------------------------- | ------------------ |
| `mapsIndoorsReady` | Ready event emitted when the MapsIndoors has been initialized and is ready. | `CustomEvent<any>` |


## Methods

### `clearHighlightLocation() => Promise<void>`

Clear existing MapsIndoors location highlight.

#### Returns

Type: `Promise<void>`



### `getDirectionsRendererInstance() => Promise<any>`

Get the MapsIndoors Directions Renderer Instance.

#### Returns

Type: `Promise<any>`



### `getDirectionsServiceInstance() => Promise<any>`

Get the MapsIndoors Directions Service Instance.

#### Returns

Type: `Promise<any>`



### `getMapInstance() => Promise<any>`

Get the map instance.

#### Returns

Type: `Promise<any>`



### `getMapsIndoorsInstance() => Promise<any>`

Get the MapsIndoors instance.

#### Returns

Type: `Promise<any>`



### `highlightLocation(location: Location) => Promise<void>`

Highlight a MapsIndoors location. Only a single location can be highlighted at the time.

#### Returns

Type: `Promise<void>`




----------------------------------------------


