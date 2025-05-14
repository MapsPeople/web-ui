// Use "build" from Vite to build a Web Component and React component in a distribution folder.

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
            sourcemap: true,
            lib: {
                entry: path.resolve(__dirname, 'webcomponent.js'),
                name: 'MapTemplate', // unused, but required
                fileName: format => `mapsindoors-webcomponent.${format}.js`,
                formats: ['es', 'umd']
            },
            emptyOutDir: false,
            rollupOptions: {
                output: {
                    manualChunks: false,
                    inlineDynamicImports: true
                }
            }
        },
        plugins: [
            cssInjectedByJsPlugin()
        ],
        define: {
            'process.env.NODE_ENV': '"production"',
            'process.env.npm_package_version': JSON.stringify(process.env.npm_package_version)
        }
    },
    // React Component
    {
        build: {
            outDir: './dist',
            sourcemap: true,
            lib: {
                entry: path.resolve(__dirname, 'reactcomponent.js'),
                name: 'MapTemplateReact', // unused, but required
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
        },
        plugins: [
            cssInjectedByJsPlugin()
        ]
    }
]

libraries.forEach(async (library) => {
    await build(library);
});
