// Use "build" from Vite to build a Web Component and React component in a distribution folder.

import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { cpSync } from 'fs';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentsPkgDir = path.dirname(require.resolve('@mapsindoors/components/package.json'));
const componentsEsmDir = path.join(componentsPkgDir, 'dist/esm');

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

for (const library of libraries) {
    await build(library);
}

// Copy Stencil component ESM files so they're available at runtime.
// The webcomponent imports @mapsindoors/components/dist/esm/loader.js which
// dynamically defines custom elements, and these entry files are loaded on-demand.
const distDir = path.resolve(__dirname, '../dist');
cpSync(componentsEsmDir, distDir, { recursive: true });
