import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig(() => {
    return {
        build: {
            lib: {
                entry: resolve('src', 'webcomponent.js'),
                name: 'MapsIndoorsMap',
                formats: ['es', 'umd'],
                fileName: (format) => `mapsindoors-webcomponent.${format}.js`
            }
        },
        plugins: [
           react(),
           svgr({
            svgrOptions: {}
           }),
           eslint(),
           cssInjectedByJsPlugin()
        ],
        define: {
            'process.env.NODE_ENV': '"development"'
        }
    }
});