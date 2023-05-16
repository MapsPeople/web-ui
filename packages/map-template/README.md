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
|`apiKey`|`string`|The MapsIndoors Solution you want to load. Takes both API key as string and "App alias". |
|`gmApiKey`|`string`|Your Google Maps API key. |
|`mapboxAccessToken`|`string`|Your Mapbox Access Token. Setting it will load a Mapbox map. If you set both a Mapbox Access Token and Google Maps API key, the Mapbox Access Token takes precedence. |
|`venue`|`string`|The Venue to load from your MapsIndoors Solution. |
|`locationId`|`string`|Set a MapsIndoors Location ID to show it on the map and its details in the sheet. |
|`primaryColor`|`string`|The primary color to use throughout the app. |
|`logo`|`string`|The logo to show during initial load. |
|`appUserRoles`|`array`|A list of App User Roles to apply when loading data. Used like so: `appUserRoles={["App User Role"]}`|
|`directionsFrom`|`string`|Set a MapsIndoors Location ID to be used as origin to instantly show directions. |
|`directionsTo`|`string`|Set a MapsIndoors Location ID to be used as destination to instantly show directions. |
|`externalIDs`|`array`|Array of external IDs which filters the map and shows a list of locations. Because of the way browsers work, you can not use External IDs with the `,`, `&`, `#` and `+`, character in them, as they are interpreted by the browser in a particular way. |
|`tileStyle`|`string`|Name of Tile Style to display on the map. |

## Deploying Map Template to a cloud storage provider

We often use Google Cloud Storage (GCS) for deploying small useful apps for demo purposes. This guide refers to GCS, but many of the steps are identical for AWS, Azure Blob, and the like.

Running the regular build command (`npm run build`), it's assumed that all links refer to the root of a domain. When you deploy to a storage bucket, you need to build the app with the bucket name preprended to all links. Vite has a build option to take care of this:

```zsh
$ vite build --base=/YOUR_BUCKET_NAME
```

At this point you can upload the files manually to your bucket, or use the helpful CLI [`gsutil`](https://cloud.google.com/storage/docs/gsutil) for the purpose. This command uploads the complete `build` folder, and prevents the files from being cached:

```zsh
$ gsutil -m -h "Cache-Control:public, max-age=0, no-store, no-cache" cp -r build gs://YOUR_BUCKET_NAME
```
