module.exports = {
    // ...
    webpack: {
        alias: { /* ... */ },
        plugins: {
            add: [ /* ... */],
            remove: [ /* ... */],
        },
        configure: (webpackConfig, { env, paths }) => {
            /* ... */
            return webpackConfig;
        },
        options: {
            ignore: ['../../node_modules/mapbox-gl/dist/mapbox-gl.js']
        }
    },
};