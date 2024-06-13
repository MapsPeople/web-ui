# MapsIndoors Web UI Tests

This package can assist in testing out the Map Template assets that are published to NPM before publishing.

## `web-component`

Use a locally built Map Template Web Component on a simple HTML page.

### Running it

The page requires the web component to be built in the Map Template package:

1. From within the `packages/map-template` folder, run `npm run build-for-npm`.
2. In the file `packages/tests/web-component/index.html` configure the Map Template Web Component, `<mapsindoors-map />` with the props that you want (access tokens, API keys etc.).
3. From within the `packages/tests/web-component` folder, serve the HTML file by running `npm run dev`.
4. Open `http://localhost:3000` in your browser.

## `react-component`

Use a locally built Map Template React Component in a React App.

### Running it

The React test app requires the React component to be built in the Map Template package:

1. From within the `packages/map-template` folder, run `npm run build-for-npm`.
2. In the file `packages/tests/react-component/src/App.jsx` configure the `<MapsIndoorsMap />` React component with the props that you want (access tokens, API key etc.).
3. From within the `packages/tests/react-component` folder, make sure to install the dependencies `npm install`. This should only be done once.
4. From within the `packages/tests/react-component` folder, serve the app by running `npm run dev`.
5. Open `http://localhost:3000` in your browser.
