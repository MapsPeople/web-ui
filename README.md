# MapsIndoors Web UI

This monorepo contains all UI projects for the MapsIndoors platform for Web. It is managed with [Lerna](https://lerna.js.org), which makes it easier to work with multiple connected projects in one repo, like this.

The repo consists of these _packages_, which are all found in the `packages` folder:

- `components`, the MapsIndoors Web Components found at [@mapsindoors/components](https://www.npmjs.com/package/@mapsindoors/components)
- `demos`, a collection of demos of how to use the _packages_ in this repo
- `mapsindoors-map-react`, the MapsIndoors Map Template, a React app helping you get up and running fast and easy
- `midt`, i.e. MapsIndoors Design Tokens, a design library used as the foundation for UI styles across MapsIndoors

## A quick primer on Lerna

Built on top of [npm's Workspaces feature](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true), [Lerna](https://lerna.js.org) makes sure you install the packages defined in each individual _package's_ `package.json`. In this case, from `components`, `mapsindoors-map-react` and `midt`. At the same time, you install the latest version of each of those projects so you can work with them across your _packages_ in this repo. We often make changes to `components` we need for a feature in the `mapsindoors-map-react` project. Using [Lerna](https://lerna.js.org), we don't have to deal with `npm link`, but can work on one feature across projects easily.

