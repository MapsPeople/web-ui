# MapsIndoors Web UI Tests

## `web-component`

Use a locally built Map Template Web Component on a simple HTML page.

### Running it

The page requires the web component to be built in the Map Template package:

1. From within the `packages/map-template` folder, run `npm run build-for-npm`.
2. In the file `packages/tests/web-component/index.html` configure the Map Template Web Component, `<mapsindoors-map />` with the props that you want (access tokens, API keys etc.).
3. From within the `packages/tests/web-component` folder, serve the HTML file by running `npm run dev`.
4. Open `http://localhost:3000` in your browser.
