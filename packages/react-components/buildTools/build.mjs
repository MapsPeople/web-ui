// Use "build" from Vite to build the React component in a distribution folder.

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const libraries = [
    // React Component
    {
        build: {
            outDir: './dist',
            lib: {
                entry: path.resolve(__dirname, 'reactcomponent.js'),
                name: 'MIMapReact', // unused, but required
                fileName: format => `mi-map-react.${format}.js`,
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
        },
        plugins: [
            cssInjectedByJsPlugin()
        ]
    }
]

libraries.forEach(async (library) => {
    await build(library);
});
