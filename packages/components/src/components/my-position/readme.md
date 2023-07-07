# mi-my-position

The `<mi-my-position>` element can be used to display a floor-selector.

Working example:

<div>
    <div id="map"></div>
</div>

<script>
    //The MapsIndoors API key, and the language code is set before the SDK is initialized
    mapsindoors.MapsIndoors.setMapsIndoorsApiKey('173386a6ff5e43cead3e396b');
    mapsindoors.MapsIndoors.setLanguage('en');

    const accessToken = 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg';
    const mapView = new mapsindoors.mapView.MapboxView({
        accessToken: accessToken,
        element: document.getElementById('map'),
        center: { lat: 57.047912598086846, lng: 9.932579446029946 },
        zoom: 18,
        maxZoom: 21
    });

    const mi = new mapsindoors.MapsIndoors({
        mapView: mapView,
        labelOptions: {
            pixelOffset: { width: 0, height: 14 }
        }
    });

    const mapBox = mapView.getMap();

    const myPositionElement = document.createElement('mi-my-position');
    myPositionElement.mapsindoors = mi;
    
    mapBox.addControl({ onAdd: function () { return myPositionElement }, onRemove: function () { } });
</script>

Example usage:

```html
<!-- HTML -->

<div>
    <div id="map"></div>
</div>
```

```js
    mapsindoors.MapsIndoors.setMapsIndoorsApiKey('173386a6ff5e43cead3e396b');
    mapsindoors.MapsIndoors.setLanguage('en');

    const accessToken = 'pk.eyJ1IjoiZW5lcHBlciIsImEiOiJjazVzNjB5a3EwODd0M2Ztb3FjYmZmbzJhIn0._fo_iTl7ZHPrl634-F2qYg';
    const mapView = new mapsindoors.mapView.MapboxView({
        accessToken: accessToken,
        element: document.getElementById('map'),
        center: { lat: 57.047912598086846, lng: 9.932579446029946 },
        zoom: 18,
        maxZoom: 21
    });

    const mi = new mapsindoors.MapsIndoors({
        mapView: mapView,
        labelOptions: {
            pixelOffset: { width: 0, height: 14 }
        }
    });

    const mapBox = mapView.getMap();

    const myPositionElement = document.createElement('mi-my-position');
    myPositionElement.mapsindoors = mi;
    
    mapBox.addControl({ onAdd: function () { return myPositionElement }, onRemove: function () { } });
```

## `mapsindoors` attribute

A `mapsindoors` attribute is available on the `<mi-my-position>` element, which is required to generate the my-position element.

## `myPositionOptions` attribute

A `myPositionOptions` attribute is available on the `<mi-my-position>` element. Reference: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/PositionControlOptions.html.

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description                                                                                        | Type  | Default     |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | ----- | ----------- |
| `mapsindoors`       | `mapsindoors`         | MapsIndoors instance.                                                                              | `any` | `undefined` |
| `myPositionOptions` | `my-position-options` | Reference: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/PositionControlOptions.html. | `any` | `undefined` |


## Events

| Event               | Description | Type                  |
| ------------------- | ----------- | --------------------- |
| `position_error`    |             | `CustomEvent<object>` |
| `position_received` |             | `CustomEvent<object>` |


----------------------------------------------


