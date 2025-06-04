import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { postcss } from '@stencil-community/postcss';
import autoprefixer from 'autoprefixer';

// Serve each component test.html file
const dirs = readdirSync('./src/components').filter(f => statSync(join('./src/components', f)).isDirectory());
const testPageOutputTargets: any[] = [];
dirs.forEach(dir => {
    const testFilePath = './src/components/' + dir + '/test.html';
    if (existsSync(testFilePath)) {
        const target = {
            type: 'www',
            indexHtml: dir + '.html',
            copy: [
                { src: './components/' + dir + '/test.html' }
            ],
            serviceWorker: null
        };

        testPageOutputTargets.push(target);
    }
});

export const config: Config = {
    testing: {
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
        // To watch E2E run locally in a browser: Enable the lines below AND disable
        // the line above. Run: npx stencil test --e2e browserHeadless: false,
        // browserDevtools: true,
        // browserSlowMo: 1000 //milliseconds
    },
    namespace: 'mi-components',
    devServer: {
        port: 3001,
        openBrowser: true,
        initialLoadUrl: 'components/'
    },
    plugins: [
        sass({
            includePaths: ['./node_modules/']
        }),
        postcss({
            plugins: [
                autoprefixer({
                    overrideBrowserslist: ['last 3 versions, not ie < 11, not dead'],
                    grid: 'autoplace',
                    cascade: false
                })
            ]
        })
    ],
    outputTargets: [
        { type: 'dist', esmLoaderPath: '../loader' },
        {
            type: 'docs-readme',
            dependencies: false,
            footer: '',
        },
        ...testPageOutputTargets
    ]
};
