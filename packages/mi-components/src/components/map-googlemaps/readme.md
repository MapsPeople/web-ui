# mi-map-googlemaps

The `<mi-map-googlemaps>` element can be used to display and interact with MapsIndoors and Google Maps.

Working example:

<mi-map-googlemaps
    style="width: 600px; height: 400px;"
    gm-api-key="AIzaSyBNhmxW2OntKAVs7hjxmAjFscioPcfWZSc"
    mi-api-key="demo"
    floor-selector-control-position="TOP_LEFT"
    my-position-control-position="TOP_RIGHT">
</mi-map-googlemaps>

<button onclick="previousStep()">Previous Step</button>
<button onclick="nextStep()">Next Step</button>

<script>
    const miMapElement = document.querySelector('mi-map-googlemaps');
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
</script>

Example usage:

```html
<!-- HTML -->

<mi-map-googlemaps
    style="width: 600px; height: 400px;"
    gm-api-key="AIzaSyBNhmxW2OntKAVs7hjxmAjFscioPcfWZSc"
    mi-api-key="demo"
    floor-selector-control-position="TOP_LEFT"
    my-position-control-position="TOP_RIGHT">
</mi-map-googlemaps>

<button onclick="previousStep()">Previous Step</button>
<button onclick="nextStep()">Next Step</button>
```

```js
// JavaScript

const miMapElement = document.querySelector('mi-map-googlemaps');
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

## `gmApiKey` attribute

A `gmApiKey` attribute is available on the `<mi-map-googlemaps>` element, which should be used to set the Google Maps API-Key. The attribute is required.

## `miApiKey` attribute

A `miApiKey` attribute is available on the `<mi-map-googlemaps>` element, which should be used to set the MapsIndoors API-Key. The attribute is required for the component to automatically insert and initialize the MapsIndoors JS SDK in the DOM.

## gmOptions attribute

A `gmOptions` attribute is available on the `<mi-map-googlemaps>` element, which can be used to control the Google Maps options.

For most Solutions, the upper bound for the `maxZoom` value is 21, but for some it's 22. Get in touch to hear more about whether zoom level 22 works for your Solution.

See the `MapOptions` interface here: <https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions>

## `disableExternalLinks` attribute

A `disableExternalLinks` attribute is available on the `<mi-map-googlemaps>` element, which can be set to `true` to prevent external links on the map from opening. This can be useful when running the map on a kiosk where you never want the browser to navigate away.

## `floorSelectorControlPosition` attribute

A `floorSelectorControlPosition` attribute is available on the `<mi-map-googlemaps>` element, which can be used to control where and if the Floor Selector should be rendered.

See available values here:
<https://developers.google.com/maps/documentation/javascript/controls#ControlPositioning>

## `floorIndex` attribute

A `floorIndex` attribute is available on the `<mi-map-googlemaps>` element, which can be used to set or get the current floor index.

## `myPositionControlPosition` attribute

A `myPositionControlPosition` attribute is available on the `<mi-map-googlemaps>` element, which can be used to control where and if the Position Control should be rendered.

See the control positions support here:
<https://developers.google.com/maps/documentation/javascript/controls#ControlPositioning>

## `polygonHighlightOptions` attribute

A `polygonHighlightOptions` attribute is available on the `<mi-map-googlemaps>` element, which can be used to control if and how locations should be highlighted. Set attribute to null to disable highlighting.

## `polylineOptions` attribute

A `polylineOptions` attribute is available on the `<mi-map-googlemaps>` element, which can be used to style how the polyline looks when getting a route.

## `language` attribute

A `language` attribute is available on the `<mi-map-googlemaps>` element, which can be used to set the component language. This attribute will not react to changes. Default is set to English (en).

## `mapsIndoorsReady` event

A `mapsIndoorsReady` event is emitted from the `<mi-map-googlemaps>` element when MapsIndoors is ready.

## `getMapInstance` method

A `getMapInstance` method is available on the `<mi-map-googlemaps>` element, which can be used to get the Google Maps instance.

## `getMapsIndoorsInstance` method

A `getMapsIndoorsInstance` method is available on the `<mi-map-googlemaps>` element, which can be used to get the MapsIndoors instance.

## `getDirectionsServiceInstance` method

A `getDirectionsServiceInstance` method is available on the `<mi-map-googlemaps>` element, which can be used to get the MapsIndoors DirectionsService Instance.

See the `DirectionsService` class here:
<https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.services.DirectionsService.html>

## `getDirectionsRendererInstance` method

A `getDirectionsRendererInstance` method is available on the `<mi-map-googlemaps>` element, which can be used to get the MapsIndoors DirectionsRenderer Instance.

See the `DirectionsRenderer` class here:
<https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/mapsindoors.directions.DirectionsRenderer.html>

## `highlightLocation` method

A `highlightLocation` method is available on the `<mi-map-googlemaps>` element, which can be used to highlight a single MapsIndoors location. The method accepts a MapsIndoors location object. The highlight options can set at the `polygonHighlightOptions` attribute.

## `clearHighlightLocation` method

A `clearHighlightLocation` method is available on the `<mi-map-googlemaps>` element, which can be used to dismiss a already existing MapsIndoors location highlight.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property                       | Attribute                         | Description                                                                                                                                                                                                                                                                                                                                                   | Type                                                                                                            | Default                                                                                                                                              |
| ------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disableExternalLinks`         | `disable-external-links`          | Set to true to prevent external links on the map from opening. This can be useful when running the map on a kiosk where you never want the browser to navigate away.                                                                                                                                                                                          | `boolean`                                                                                                       | `false`                                                                                                                                              |
| `floorIndex`                   | `floor-index`                     | Set or get the current floor index shown on the map.                                                                                                                                                                                                                                                                                                          | `string`                                                                                                        | `undefined`                                                                                                                                          |
| `floorSelectorControlPosition` | `floor-selector-control-position` | Render the floor selector as a Map Control at the given position.                                                                                                                                                                                                                                                                                             | `string`                                                                                                        | `undefined`                                                                                                                                          |
| `gmApiKey`                     | `gm-api-key`                      | The Google Maps API key.                                                                                                                                                                                                                                                                                                                                      | `string`                                                                                                        | `''`                                                                                                                                                 |
| `gmOptions`                    | --                                | Google Maps options. Defaults to zoom: 17, maxZoom: 21, center: { lat: 0, lng: 0 }, mapTypeControl: false, streetViewControl: false. https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions                                                                                                                                     | `MapOptions`                                                                                                    | `{         zoom: 17,         maxZoom: 21,         center: { lat: 0, lng: 0 },         mapTypeControl: false,         streetViewControl: false     }` |
| `language`                     | `language`                        | Set the component language. Default set to English (en). Will not react to changes.                                                                                                                                                                                                                                                                           | `string`                                                                                                        | `'en'`                                                                                                                                               |
| `miApiKey`                     | `mi-api-key`                      | The MapsIndoors API key.                                                                                                                                                                                                                                                                                                                                      | `string`                                                                                                        | `''`                                                                                                                                                 |
| `myPositionControlPosition`    | `my-position-control-position`    | Render the My Position Control as a Map Control at the given position.                                                                                                                                                                                                                                                                                        | `string`                                                                                                        | `undefined`                                                                                                                                          |
| `polygonHighlightOptions`      | --                                | Styling of polygon highlight when a location is clicked. Set it to null to turn off highlighting.                                                                                                                                                                                                                                                             | `{ strokeColor: string; strokeOpacity: number; strokeWeight: number; fillColor: string; fillOpacity: number; }` | `{         strokeColor: '#EF6CCE',         strokeOpacity: 1,         strokeWeight: 2,         fillColor: '#EF6CCE',         fillOpacity: 0.2     }`  |
| `polylineOptions`              | --                                | Styling of how the polyline looks when getting a route. Color: The stroke color of direction polyline on the map. Accepts any legal HTML color value. Default: '#307ad9'. Opacity: The stroke opacity of directions polylines on the map. Numerical value between 0.0 and 1.0. Default: 1. Weight: The width of the direction polyline in pixels. Default: 4. | `{ color: string; weight: number; opacity: number; }`                                                           | `{         color: '#3071d9',         opacity: 1,         weight: 4     }`                                                                            |


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


