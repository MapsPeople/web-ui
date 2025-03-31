import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';
import svgr from 'vite-plugin-svgr';


export default defineConfig(() => {
    return {
        server: {
            port: 3000
        },
        build: {
            outDir: 'build',
            sourcemap: true,
            rollupOptions: {
                // Exclude test files from the production build
                // - *.test.* files (Jest unit tests)
                // - *.spec.* files (component specs)
                // - *.e2e.* files (end-to-end tests)
                // - Any files in __tests__ directories
                external: [
                    /\.test\.(js|jsx|ts|tsx)$/,
                    /\.spec\.(js|jsx|ts|tsx)$/,
                    /\.e2e\.(js|jsx|ts|tsx)$/,
                    '**/__tests__/**'
                ]
            }
        },
        plugins: [
            react(),
            svgr(),
            ViteFaviconsPlugin('./public/favicon.png'),
            eslint(),
            sentryVitePlugin({
                org: process.env.SENTRY_ORG,
                project: process.env.SENTRY_PROJECT,

                // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
                authToken: process.env.SENTRY_AUTH_TOKEN,
                reactComponentAnnotation: { enabled: true },
            }),
        ]
    }
});