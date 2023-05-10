// Use "build" from Vite to build a web component and React component in a distribution folder.

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const libraries = [
    // Web Component
    {
        build: {
            outDir: './dist',
            lib: {
                entry: path.resolve(__dirname, 'webcomponent.js'),
                name: 'MapTemplate',
                fileName: format => `mapsindoors-webcomponent.${format}.js`,
                formats: ['es', 'umd']
            },
            emptyOutDir: false,
        },
        plugins: [
            cssInjectedByJsPlugin()
        ],
        define: {
            'process.env.NODE_ENV': '"production"'
        }
    },
    // React Component
    {
        build: {
            outDir: './dist',
            lib: {
                entry: path.resolve(__dirname, 'reactcomponent.js'),
                name: 'MapTemplateReact',
                fileName: format => `mapsindoors-react.${format}.js`,
                formats: ['es', 'umd']
            },
            emptyOutDir: false,
            rollupOptions: {
                external: ['react', 'react-dom'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM'
                    }
                }
            }
        }
    }
]

libraries.forEach(async (library) => {
    await build(library);
});
