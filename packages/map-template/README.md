# Map Template

# Web component: Installation and usage

## Using NPM

Install the package:

`npm install @mapsindoors/map-template`

In your script:

```javascript
import MapsIndoorsMap from '@mapspeople/map-template/dist/mapsindoors-webcomponent.es';
window.customElements.define('mapsindoors-map', MapsIndoorsMap);
```

In your styles make sure to give it a size:

```css
mapsindoors-map {
    display: block;
    width: 100vw;
    height: 100vh;
}
```

Use it in your HTML:

```html
<mapsindoors-map api-key="mapspeople"></mapsindoors-map>
```

Replace the `api-key` value with your MapsPeople API key.

## Using just the browser

```html
<script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.21.4/mapsindoors-4.21.4.js.gz"></script>
<script type="module">
    import MapsindoorsMap from 'https://www.unpkg.com/@mapspeople/map-template/dist/mapsindoors-webcomponent.es.js';
    window.customElements.define('mapsindoors-map', MapsIndoorsMap)
</script>
<style>
      body {
            margin: 0;
      }
      mapsindoors-map {
            display: block;
            width: 100vw;
            height: 100vh;
      }
</style>

<mapsindoors-map api-key="mapspeople"></mapsindoors-map>
```

Replace the `api-key` value with your MapsPeople API key.

# React component: Installation and usage

## Using NPM

Install the package:

`npm install @mapsindoors/map-template`

In a React component:

```javascript
import MapsIndoorsMap from '@mapspeople/map-template/dist/mapsindoors-react.es';

// Somewhere in your JSX:
<div style={{
      display: 'block',
      width: '100vw',
      height: '100vh'
}}>
      <MapsIndoorsMap
      apiKey="mapspeople"
      ></MapsIndoorsMap>
</div>

```

Replace the `api-key` value with your MapsPeople API key.

# Supported properties on the MapsIndoors Map components

Note that when using the React component, the properties should conform to JSX prop naming, eg. `api-key` becomes `apiKey`.

|Property|Type|Description|
|:--|:--|:--|
|`api-key`|`string`|The MapsIndoors Solution you want to load. Takes both API key as string and "App alias". |
|`gm-api-key`|`string`|Your Google Maps API key. |
|`mapbox-access-token`|`string`|Your Mapbox Access Token. Setting it will load a Mapbox map. If you set both a Mapbox Access Token and Google Maps API key, the Mapbox Access Token takes precedence. |
|`venue`|`string`|The Venue to load from your MapsIndoors Solution. |
|`location-id`|`string`|Set a MapsIndoors Location ID to show it on the map and its details in the sheet. |
|`primary-color`|`string`|The primary color to use throughout the app. |
|`logo`|`string`|The logo to show during initial load. |
|`app-user-roles`|`array`|A list of App User Roles to apply when loading data. Used like so: `app-user-roles={["App User Role"]}`|
|`directions-from`|`string`|Set a MapsIndoors Location ID to be used as origin to instantly show directions. Must be used together with `directions-to`|
|`directions-to`|`string`|Set a MapsIndoors Location ID to be used as destination to instantly show directions. Must be used together with `directions-from`|
|`external-ids`|`array`|Array of external IDs which filters the map and shows a list of locations. |
