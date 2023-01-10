# MapsIndoors UI

## Run and develop locally

The projects is setup with [Lerna](https://lerna.js.org/).

1. Clone the repo
2. Run `npm install` in the root of the repo.
3. Run `npx lerna run build` in the root of the repo.

### Run the React project

1. Run `npm start` from the `packages/mapsindoors-map-react` folder.

### Develop on the Stencil components

1. `cd` into the `packages/mi-components` folder.
2. Run `npm start`

To have any Stencil component changes be reflected in the React project, you need to run  `npx lerna run build` from the  root folder. There are no watch scripts yet.
