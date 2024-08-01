import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const libraries = [
    {
        build: {
            outDir: './dist',
            lib: {
                entry: path.resolve(__dirname, 'public_components.js'),
                name: 'MapTemplateReact', // unused, but required
                fileName: format => `map.${format}.js`,
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
];

libraries.forEach(async (library) => {
    await build(library);
});
