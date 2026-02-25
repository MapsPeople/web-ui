// Use "build" from Vite to build a Web Component and React component in a distribution folder.

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { cpSync, readdirSync } from 'fs';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentsPkgDir = path.dirname(require.resolve('@mapsindoors/components/package.json'));
const componentsEsmDir = path.join(componentsPkgDir, 'dist/esm');

// Shared Stencil runtime chunks that must NOT be bundled into the webcomponent.
// Both the bundle and the lazy-loaded entry files (mi-search.entry.js etc.) import
// these. If they were inlined, two separate module instances would exist and the
// Stencil `plt` state would be duplicated — components would never render.
// Marking them external keeps a single shared instance at runtime.
//
// These are the Rollup-generated shared chunks — identified by a content hash
// suffix (e.g. index-7e9696f3.js, utils-ae714467.js). Entry files (*.entry.js),
// the loader (loader.js, index.js) and the CDN bundle (mi-components.js) do not
// carry a hash and are intentionally excluded.
const CHUNK_HASH_PATTERN = /-[0-9a-f]{8}\.js$/;
const stencilSharedFiles = readdirSync(componentsEsmDir)
    .filter(f => CHUNK_HASH_PATTERN.test(f))
    .map(f => path.join(componentsEsmDir, f));

const stencilExternalPaths = Object.fromEntries(
    stencilSharedFiles.map(f => [f, './' + path.basename(f)])
);

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
                formats: ['es']
            },
            emptyOutDir: false,
            rollupOptions: {
                external: stencilSharedFiles,
                output: {
                    manualChunks: false,
                    inlineDynamicImports: true,
                    paths: stencilExternalPaths
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

for (const library of libraries) {
    await build(library);
}

// Copy Stencil component ESM files from @mapsindoors/components so they can be
// fetched at runtime by the lazy-loader dynamic import (`./${componentName}.entry.js`).
const distDir = path.resolve(__dirname, '../dist');
cpSync(componentsEsmDir, distDir, { recursive: true });
