# MapsIndoors Web UI

This monorepo contains all UI projects for the MapsIndoors platform for Web. It is managed with [Lerna](https://lerna.js.org), which makes it easier to work with multiple connected projects in one repo, like this.

The repo consists of these _packages_, which are all found in the `packages` folder:

- `components`, the MapsIndoors Web Components found at [@mapsindoors/components](https://www.npmjs.com/package/@mapsindoors/components)
- `demos`, a collection of demos of how to use the _packages_ in this repo
- `mapsindoors-map-react`, the MapsIndoors Map Template, a React app helping you get up and running fast and easy
- `midt`, i.e. MapsIndoors Design Tokens, a design library used as the foundation for UI styles across MapsIndoors

## `mapsindoors-map-react` aka. Map Template

This app is built on React, with our Web Components used where applicable.

To get the app up and running, clone this repo, install everything using [Lerna](https://lerna.js.org), and start the app:

```zsh
git clone git@github.com:MapsPeople/web-ui.git
cd web-ui && npm install && npx run lerna build
cd packages/mapsindoors-map-react && npm run start
```

<details>
  <summary>A quick primer on Lerna</summary>
  <p>Built on top of [npm's Workspaces feature](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true), [Lerna](https://lerna.js.org) makes sure you install the packages defined in each individual _package's_ `package.json`. In this case, from `components`, `mapsindoors-map-react` and `midt`. At the same time, you install the latest version of each of those projects so you can work with them across your _packages_ in this repo. We often make changes to `components` we need for a feature in the `mapsindoors-map-react` project. Using [Lerna](https://lerna.js.org), we don't have to deal with `npm link`, but can work on one feature across projects easily.</p>
</details>

The Map Template has a main `MapsIndoorsMap` React component. It wraps the whole app inside of it. It's used in a function in `App.js` which is imported into `index.js` where it's defined that an HTML element with `id="root"` will render the app. We show how that is done in `packages/mapsindoors-map-react/public/index.html`.

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
      - mi-route-instructions-maneuver
      - mi-icon
      - mi-time
      - mi-distance
```

The `mi-route-instructions-step` Web Component uses `mi-route-instructions-maneuver` to render sub steps, `mi-icon` for icons, and `mi-time` and `mi-distance` to show estimated time and distance.

We use `mi-route-instructions-step` in the React Component `RouteInstructions` to show, well, route instructions. This is used inside of an "umbrella" component for all directions (including searching for where to go) called `Directions`.

Everything in the app is displayed in the `BottomSheet` (on mobile viewports), and the main app component is named `MapsIndoorsMap`.

If you have a React app, you can use any of these React Components in your own app. If you want to not use a bottom sheet for instance, you could import the `Directions` component and work with that in your app.

## `components`

1. `cd` into the `packages/components` folder.
2. Run `npm start`

To have any Stencil component changes be reflected in the React project, you need to run  `npx lerna run build` from the root folder. There are no watch scripts yet.
