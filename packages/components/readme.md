
# MapsIndoors Web Components

**Stencil project with MI-Components**

The library is published on NPM as: [@mapsindoors/components](https://www.npmjs.com/package/@mapsindoors/components)

Read more about Stencil here: [Getting started](https://stenciljs.com/docs/getting-started)

## Local development

In a terminal:

```bash
git clone git@github.com:MapsPeople/web-ui.git
cd web-ui
npx lerna run build
npm ci
cd packages/components
npm run start
```

When the server is up and running, open the project demo page in your browser:
<http://localhost:3000/>

For "manually" controlling the components, open the inspector to change attribute(s) in the HTML or call methods via the developer console.

## Getting started

### MI Components as an NPM dependency in an Angular project

- Install the MapsIndoors components dependency with `npm install @mapsindoors/components`
- Install the TypeScript definitions for Google Maps JavaScript API with `npm install @types/googlemaps`
- Follow the instructions provided by Stencil to use a Stencil-built web component collection: <https://stenciljs.com/docs/angular>

### MI Components as a Symlink

- Run `npm link` in the package folder.
- Next, in another package folder, run `npm link package-name`.
- To see what the `package-name` is, run `npm ls -g --depth=0 --link=true`, which outputs all global symlinks, you've created.

### Setting the element type

When getting a reference to a MI Component element in the view, the type can be set like below:

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

If you just want to build the Docs folder, run this command: `npm run build && npm run docs.build`.

## Publishing

When you want to publish to your changes to NPM, do the following from the local directory based on the main branch:
If your feature/bugfix was approved:

- Stay on the branch that you were working on locally
- Make sure that besides your changes you are up-to-date with main remote repository
- Describe the changes that your feature or bugfix consists in `CHANGELOG.md`, commit the changes (message example: 'changelog for version x.x.x release') and push them (still on your ticket-related branch)
- When the pipeline succeeds, double-check your changes and merge it to main
- Checkout to main locally and pull the latest changes
- Run `npm login` to login to NPM. This requires you to have an account on [npmjs.com](https://www.npmjs.com), and your account should be part of the `mapsindoors` organization.
- Run `npm version patch`, `npm version minor` or `npm version major` depending on the scope of your changes.
- Run `git push`. Check the pipeline for the `deploy-docs` and `changelog` jobs

The `npm version` command will upgrade the package, commit it, and publish a distribution build to [@mapsindoors/components](https://www.npmjs.com/package/@mapsindoors/components).
There you can also check if your latest version was released.
