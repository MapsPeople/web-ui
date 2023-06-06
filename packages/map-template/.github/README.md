# Map Template

This app is built on React, with our Web Components used where applicable.

## Running the app

To get the app up and running, clone this repo, install everything using [Lerna](https://lerna.js.org), and start the app:

```zsh
$ git clone https://github.com/MapsPeople/web-ui.git
$ cd web-ui && npm install && npx lerna run build
$ cd packages/map-template && npm run start
```

Now open the app served on [http://localhost:3000/](http://localhost:3000/).

The Map Template has a main `MapsIndoorsMap` React component. It wraps the whole app inside of it. It's used in a function in `App.jsx` which is imported into `index.jsx` where it's defined that an HTML element with `id="root"` will render the app. We show how that is done in `packages/map-template/index.html`.

### Adding Google Maps API Keys or Mapbox Access Tokens

Rename `.env.example`, to `.env` and add either of the keys (or both) to that file, and the maps will load properly.

### React Components

We follow [the React convention](https://reactjs.org/docs/faq-structure.html#avoid-too-much-nesting) with one level of depth in the Components' folder. We still import React components into each other (even in multiple levels), but the folder structure is flat.

### Web Components

We use our own Web Components ([Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)) from `packages/components` inside of the Map Template. To illustrate the relation between the React app, its React Components and our Web Components, here's a drawing of how this works in the Route Instructions part of the app:

```
// public/index.html

- App.js
 - MapsIndoorsMap
  - BottomSheet
   - Directions
    - RouteInstructions
     - mi-route-instructions-step
      - mi-icon
      - mi-time
      - mi-distance
```

The `mi-route-instructions-step` Web Component uses `mi-route-instructions-maneuver` to render sub steps, `mi-icon` for icons, and `mi-time` and `mi-distance` to show estimated time and distance.

We use `mi-route-instructions-step` in the React Component `RouteInstructions` to show, well, route instructions. This is used inside of an "umbrella" component for all directions (including searching for where to go) called `Directions`.

Everything in the app is displayed in the `BottomSheet` (on mobile viewports), and the main app component is named `MapsIndoorsMap`.

If you have a React app, you can use any of these React Components in your own app. If you want to not use a bottom sheet for instance, you could import the `Directions` component and work with that in your app.

#### Working on Components used in Map Template

To have any Stencil component changes be reflected in this project, you need to run  `npx lerna run build` from the root folder. There are no watch scripts yet.

## Supported properties on the MapsIndoors Map component

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
|`directionsFrom`|`string`|Set a MapsIndoors Location ID or the string `USER_POSITION` to be used as origin to instantly show directions. |
|`directionsTo`|`string`|Set a MapsIndoors Location ID or the string `USER_POSITION` to be used as destination to instantly show directions. |
|`externalIDs`|`array`|Array of external IDs which filters the map and shows a list of locations. Because of the way browsers work, you can not use External IDs with the `,`, `&`, `#` and `+`, character in them, as they are interpreted by the browser in a particular way. |
|`tileStyle`|`string`|Name of Tile Style to display on the map. |
|`startZoomLevel`|`number`|The initial zoom level of the map. |

## Deploying Map Template to a cloud storage provider

We often use Google Cloud Storage (GCS) for deploying small useful apps for demo purposes. This guide refers to GCS, but many of the steps are identical for AWS, Azure Blob, and the like.

Running the regular build command (`npm run build`), it's assumed that all links refer to the root of a domain. When you deploy to a storage bucket, you need to build the app with the bucket name preprended to all links. Vite has a build option to take care of this:

```zsh
$ npx vite build --base=/YOUR_BUCKET_NAME
```

At this point you can upload the files manually to your bucket, or use the helpful CLI [`gsutil`](https://cloud.google.com/storage/docs/gsutil) for the purpose. This command uploads the complete `build` folder, and prevents the files from being cached:

```zsh
$ gsutil -m -h "Cache-Control:public, max-age=0, no-store, no-cache" cp -r build gs://YOUR_BUCKET_NAME
```
