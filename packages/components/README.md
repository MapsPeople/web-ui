
# MapsIndoors Web Components

**Stencil project with MI-Components**

The library is published on NPM as: [@mapsindoors/components](https://www.npmjs.com/package/@mapsindoors/components)

Read more about Stencil here: [Getting started](https://stenciljs.com/docs/getting-started)

## Local development

In a terminal:

```bash
$ git clone git@github.com:MapsPeople/web-ui.git && cd web-ui
$ npm ci && npx lerna run build && cd packages/components
$ npm run start
```

When the server is up and running, open the project demo page in your browser:
<http://localhost:3000/>

For "manually" controlling the components, open the Inspector to change attribute(s) in the HTML, or call methods via the developer console.

## Getting started

### MI Components as an NPM dependency in an Angular project

- Install the MapsIndoors components dependency with `npm install @mapsindoors/components`
- Install the TypeScript definitions for Google Maps JavaScript API with `npm install @types/googlemaps`
- Follow the instructions provided by Stencil to use a Stencil-built web component collection: <https://stenciljs.com/docs/angular>

### Setting the element type

When getting a reference to a MI Component element in the view, the type can be set like so:

```html
<mi-search #search mapsindoors="true" [placeholder]="Start typing to search..."></mi-search>
```

```TypeScript
@ViewChild('search') miSearchComponent:
ElementRef<HTMLMiSearchElement>;
```

### Docs

To check out the compiled Docs site, it's important to first build the components and then serve the documentation site:

```bash
npm run build
npm run docs.start
```

Open the browser on <http://localhost:8000> to see the site running.

If you just want to build the Docs folder, run this command: `npm run build && npm run docs.build`
