module.exports = {
    // ...
    webpack: {
        alias: { /* ... */ },
        plugins: {
            add: [ /* ... */],
            remove: [ /* ... */],
        },
        configure: { /* ... */ },
        configure: (webpackConfig, { env, paths }) => {
            /* ... */
            return webpackConfig;
        },
        options: {
            ignore: ['../../node_modules/mapbox-gl/dist/mapbox-gl.js']
        }
    },
};