# mi-floor-selector

The `<mi-floor-selector>` element can be used to display a floor-selector.

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
        zoom: 15,
        maxZoom: 21
    });
    
    //Then the MapsIndoors SDK is initialized
    const mi = new mapsindoors.MapsIndoors({
        mapView: mapView,
        labelOptions: {
            pixelOffset: { width: 0, height: 14 }
        }
    });

    const mapBox = mapView.getMap();

    const floorSelectorElement = document.createElement('mi-floor-selector');
    floorSelectorElement.mapsindoors = mi;
    floorSelectorElement.primaryColor = '#FFC0CB';

    mapBox.addControl({ onAdd: function () { return floorSelectorElement }, onRemove: function () { } });
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
        zoom: 15,
        maxZoom: 21
    });
    
    const mi = new mapsindoors.MapsIndoors({
        mapView: mapView,
        labelOptions: {
            pixelOffset: { width: 0, height: 14 }
        }
    });

    const mapBox = mapView.getMap();

    const floorSelectorElement = document.createElement('mi-floor-selector');
    floorSelectorElement.mapsindoors = mi;
    floorSelectorElement.primaryColor = '#FFC0CB';

    mapBox.addControl({ onAdd: function () { return floorSelectorElement }, onRemove: function () { } });
```

## `mapsindoors` attribute

A `mapsindoors` attribute is available on the `<mi-floor-selector>` element, which is required to generate the floor-selector.

## `primaryColor` attribute

A `primaryColor` attribute is available on the `<mi-floor-selector>` element, which can be used to set the background color of the selected floor inside the floor-selector. Dafult value is '#005655'.

<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                                                                    | Type     | Default     |
| -------------- | --------------- | ---------------------------------------------------------------------------------------------- | -------- | ----------- |
| `mapsindoors`  | `mapsindoors`   | MapsIndoors instance.                                                                          | `any`    | `undefined` |
| `primaryColor` | `primary-color` | The color to use as the primary color (as background color of the selected floor in the list). | `string` | `'#005655'` |


----------------------------------------------


