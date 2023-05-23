# Map Template

## Web component: Installation and usage

### Using NPM

Install the package:

`npm install @mapsindoors/map-template`

In your script:

```javascript
import MapsIndoorsMap from '@mapsindoors/map-template/dist/mapsindoors-webcomponent.es.js';
window.customElements.define('mapsindoors-map', MapsIndoorsMap);
```

In your styles make sure to give it a size. For example:

```css
mapsindoors-map {
    display: block;
    width: 100vw;
    height: 100vh;
}
```

Make sure the MapsIndoors JavaScript SDK is loaded by having this somewhere in your HTML:

```html
<script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.21.5/mapsindoors-4.21.5.js.gz"></script>
```

Use the web component in your HTML:

```html
<mapsindoors-map></mapsindoors-map>
```

Add attributes to the web component as needed (see supported properties below).

## Using just the browser

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Map</title>
    <script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.21.5/mapsindoors-4.21.5.js.gz"></script>
    <script type="module">
        import MapsindoorsMap from 'https://www.unpkg.com/@mapsindoors/map-template/dist/mapsindoors-webcomponent.es.js';
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
</head>
<body>
    <mapsindoors-map></mapsindoors-map>
</body>
</html>
```

Add attributes to the web component as needed (see supported properties below).

## React component: Installation and usage

### Using NPM

Install the package:

`npm install @mapsindoors/map-template`

Make sure the MapsIndoors JavaScript SDK is loaded by having this somewhere in your HTML:

```html
<script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.21.5/mapsindoors-4.21.5.js.gz"></script>
```

Use the `MapsIndoorsMap` component in a React component:

```javascript
import MapsIndoorsMap from '@mapsindoors/map-template/dist/mapsindoors-react.es.js';

// Somewhere in your JSX:
<div style={{
      display: 'block',
      width: '100vw',
      height: '100vh'
}}>
      <MapsIndoorsMap></MapsIndoorsMap>
</div>
```

Add properties to the MapsIndoorsMap component as needed (see list below).

## Supported attributes on the MapsIndoors Map components

Note that when using the React component, the properties should conform to JSX prop naming, eg. `api-key` becomes `apiKey`.

|Attribute|React prop name|Type|Description|
|:--|:--|:--|:--|
|`api-key`|`apiKey`|`string`|The MapsIndoors Solution you want to load. Takes both API key as string and "App alias". |
|`gm-api-key`|`gmApiKey`|`string`|Your Google Maps API key. |
|`mapbox-access-token`|`mapboxAccessToken`|`string`|Your Mapbox Access Token. Setting it will load a Mapbox map. If you set both a Mapbox Access Token and Google Maps API key, the Mapbox Access Token takes precedence. |
|`venue`|`venue`|`string`|The Venue to load from your MapsIndoors Solution. |
|`location-id`|`locationId`|`string`|Set a MapsIndoors Location ID to show it on the map and its details in the sheet. |
|`primary-color`|`primaryColor`|`string`|The primary color to use throughout the app. |
|`logo`|`logo`|`string`|The logo to show during initial load. |
|`app-user-roles`|`appUserRoles`|`array`|A list of App User Roles to apply when loading data. Used like so: `appUserRoles={["App User Role"]}`|
|`directions-from`|`directionsFrom`|`string`|Set a MapsIndoors Location ID to be used as origin to instantly show directions. |
|`directions-to`|`directionsTo`|`string`|Set a MapsIndoors Location ID to be used as destination to instantly show directions. |
|`external-IDs`|`etxternalIDs`|`array`|Array of external IDs which filters the map and shows a list of locations. Because of the way browsers work, you can not use External IDs with the `,`, `&`, `#` and `+`, character in them, as they are interpreted by the browser in a particular way. |
|`tile-style`|`tileStyle`|`string`|Name of Tile Style to display on the map. |
