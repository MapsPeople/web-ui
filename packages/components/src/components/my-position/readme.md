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

## `customPositionProvider` attribute

A `customPositionProvider` attribute is available on the `<mi-my-position>` element, which allows you to provide a custom position provider instead of using the browser's GeoLocation API.

### Interface

Your custom position provider should implement the following interface:

**Modern Event-based Interface (Recommended):**
```javascript
{
    // Properties
    currentPosition: GeolocationPosition | null,
    options: {
        maxAccuracy: number,
        positionMarkerStyles: { /* styling options */ },
        accuracyCircleStyles: { /* styling options */ }
    },
    
    // Methods
    hasValidPosition(): boolean,
    on(eventName: 'position_error'|'position_received', callback: Function): void,
    off(eventName: 'position_error'|'position_received', callback: Function): void,
    setPosition(position: GeolocationPosition): void // Optional for manual position setting
}
```

**Legacy Callback-based Interface (For backward compatibility):**
```javascript
{
    isAvailable(): boolean,
    isAlreadyGranted(): Promise<boolean>,
    listenForPosition(maxAccuracy, positionError, positionInaccurate, positionRequesting, positionReceived): void,
    stopListeningForPosition(): void
}
```

### Example Usage

**Quick Example:**
```javascript
// Create a simple custom position provider
class MyCustomProvider {
    constructor() {
        this._currentPosition = null;
        this._listeners = new Map();
    }
    
    get currentPosition() { return this._currentPosition; }
    get options() { return { maxAccuracy: 20 }; }
    
    hasValidPosition() { return this._currentPosition !== null; }
    on(eventName, callback) { /* implement event handling */ }
    off(eventName, callback) { /* implement event removal */ }
    setPosition(position) { /* implement position setting */ }
}

// Use it with mi-my-position
const myPositionElement = document.createElement('mi-my-position');
myPositionElement.mapsindoors = mi;
myPositionElement.customPositionProvider = new MyCustomProvider();
```

**Complete Implementation:**
For a full TypeScript example implementation, see `CustomPositionProvider.ts` in the component source code, which demonstrates:
- Complete modern interface implementation
- Legacy interface compatibility
- Custom styling options
- Event handling patterns

## `myPositionOptions` attribute

A `myPositionOptions` attribute is available on the `<mi-my-position>` element. Reference: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/PositionControlOptions.html.

<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute             | Description                                                                                                                                                                                           | Type                | Default     |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------- |
| `customPositionProvider` | --                    | Accepts a custom position provider instance (supports both legacy and modern interfaces). This is the external API - what users pass to the component. It's optional and may be undefined or invalid. | `IPositionProvider` | `undefined` |
| `mapsindoors`            | `mapsindoors`         | MapsIndoors instance.                                                                                                                                                                                 | `any`               | `undefined` |
| `myPositionOptions`      | `my-position-options` | Reference: https://app.mapsindoors.com/mapsindoors/js/sdk/latest/docs/PositionControlOptions.html.                                                                                                    | `any`               | `undefined` |


## Events

| Event               | Description | Type                  |
| ------------------- | ----------- | --------------------- |
| `position_error`    |             | `CustomEvent<object>` |
| `position_received` |             | `CustomEvent<object>` |


## Methods

### `setPosition(position: MapsIndoorsPosition) => Promise<void>`

Sets a custom position. Works with any provider that implements setPosition.
Uses this.positionProvider (the resolved provider) instead of this.customPositionProvider
to ensure we're working with the validated, active provider.

#### Returns

Type: `Promise<void>`



### `watchPosition(selfInvoked?: boolean) => Promise<void>`

Method for requesting the current position, emitting events and showing position on map based on result.

#### Returns

Type: `Promise<void>`




----------------------------------------------


