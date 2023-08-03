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
    <title>MapsIndoors Map Template</title>
    <script type="module">
        import MapsindoorsMap from 'https://www.unpkg.com/@mapsindoors/map-template/dist/mapsindoors-webcomponent.es.js';
        window.customElements.define('mapsindoors-map', MapsindoorsMap)
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
|`start-zoom-level`|`startZoomLevel`|`number`|The initial zoom level of the map. |
|`supports-URL-parameters`|`supportsURLParameters`|`bool`|Indicates if the Map Template supports URL parameters. |

## Using Query Parameters

The Map Template supports using query parameters for all the properties provided by the MapsIndoorsMap component.
The Web component and the React component support using the URL parameters if the `supportsURLParameters` property is set to `true`.

The supported query parameters are the following:

`apiKey` - Used like this `apiKey=yourApiKey`. If no apiKey is provided, the app will default to `3ddemo`.
`venue` - Used like this `venue=yourVenueName` - the Venue property is case sensitive. If no venue is provided, the app will select the first venue from the solution in alphabetical order.
`locationId` - Used like this `locationId=yourLocationId`
`primaryColor` - Used like this `primaryColor=000000`. **Note!** You need to provide a hex color value, without the `#`, due to the hashtag being a reserved symbol that has a predefined purpose in a query string. If no primary color is provided, the app will default to the MapsPeople brand color.
`logo` - Used like this `logo=https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_7a75ff13f42605422950b411ab7e03b5/mapspeople.png`. Use an image address to provide a different logo on the loading screen. If no logo is provided, the app will default to the MapsPeople icon.
`appUserRoles` - Used like this `appUserRoles=visitor,staff,security` - the App User Roles are case sensitive. **Note!** You need to provide a list of comma separated values, without any spaces between the comma and the value. This will further be converted into an array of appUserRoles.
`directionsFrom` - Used like this `directionsFrom=yourOriginLocationId` when having a location ID, or like this `directionsFrom=USER_POSITION` when having the user location. Using the `directionsFrom` property in the URL followed by the selection of a destination location in the search view results in the wayfinding having both the origin and the destination prefilled.
`directionsTo` - Used like this `directionsTo=yourDestinationLocationId` when having a location ID, or like this `directionsTo=USER_POSITION` when having the user location.
`externalIDs` - Used like this `externalIDs=0.0.1,0.0.2,0.0.3`. **Note!** You need to provide a list of comma separated values, without any spaces between the comma and the value. This will further be converted into an array of external IDs. Because of the way browsers work, you **cannot** use External IDs with the `,`, `&`, `#` and `+`, character in them, as they are interpreted by the browser in a particular way.
`tileStyle` - Used like this `tileStyle=yourTileStyleName`. If no tile style is provided, the app will show the default tile style.
`mapboxAccessToken` - Used like this `mapboxAccessToken=yourMapboxAccessToken`. If no mapboxAccessToken is provided, the app will default to the access token in the `.env` file. If both the `mapboxAccessToken` and the `gmApiKey` are present, the app will load a Mapbox map.
`gmApiKey` - Used like this `gmApiKey=yourGmApiKey`. If no `gmApiKey` is provided, the app will default to the access token in the `.env` file. If both the `mapboxAccessToken` and the `gmApiKey` are present, the app will load a Mapbox map.
`startZoomLevel` - Used like this `startZoomLevel=22`.

**Note!** All the query parameters need to be separated with the `&` symbol, without any spaces in between. Note! When using parameters such as `directionsTo`, `directionsFrom`, `locationId`, `externalIDs`, and `tileStyle` make sure you are using the correct `apiKey` parameter to which they belong.

Example of URL:

`https://domain.com/?apiKey=yourApiKey&venue=yourVenueName&locationId=yourLocationId&primaryColor=000000&logo=https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_7a75ff13f42605422950b411ab7e03b5/mapspeople.png&appUserRoles=visitor,staff,security`

**Important!** Not all the query parameters can be used together, as they serve their own purpose which in some cases overlaps with other query parameters. Example of cases that **DON’T** work together:

`locationId` + `startZoomLevel` → the `startZoomLevel` has priority over the `locationId`

`locationId` + `externalIDs` → the `locationId` has priority over the `externalIDs`

`directionsTo` + `directionsFrom` + `locationId` → the `directionsTo` + `directionsFrom` have priority over the `locationId`

`directionsTo` + `directionsFrom` + `externalIDs` → the `directionsTo` + `directionsFrom` have priority over the `externalIDs`