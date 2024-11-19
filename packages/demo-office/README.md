# MapsIndoors Office Demo

Created with Vite.

## Running it locally

1. Get a Mapbox Access Token
   - The demo app uses Mapbox as a map provider. You will need a Mapbox Access Token in order to run the app.
   [Read about Mapbox Access tokens here](https://docs.mapbox.com/help/getting-started/access-tokens/)
   - When you have a Mapbox Access Token, copy the file `.env.example` into a new file with the name `.env` in the same folder, and replace the text `mapbox access token` with your Mapbox Access token. This access token will now be used when showing the Mapbox map.

2. run `npm install && npx lerna run build` from the root folder of the repository
3. run `npm run dev` from the `packages/demo-office` folder.
