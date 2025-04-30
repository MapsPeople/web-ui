import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon2';
import svgr from 'vite-plugin-svgr';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            port: 3000
        },
        build: {
            outDir: 'build',
            sourcemap: true,
        },
        plugins: [
            react(),
            svgr(),
            ViteFaviconsPlugin('./public/favicon.png'),
            eslint(),
            sentryVitePlugin({
                org: env.SENTRY_ORG,
                project: env.SENTRY_PROJECT,
                // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
                authToken: env.SENTRY_AUTH_TOKEN,
                release: {
                    name: `map-template@${process.env.npm_package_version}`,
                    uploadSourceMaps: true,
                    finalize: true,
                },
                sourceMaps: {
                    include: ['./build', './dist'],
                    ignore: ['node_modules'],
                    urlPrefix: '~/',
                },
                reactComponentAnnotation: { enabled: true },
                denyUrls: [/https?:\/\/app\.mapsindoors\.com\/mapsindoors\/js\/sdk\//], // Exclude the MapsIndoors SDK from Sentry error tracking
            }),
        ]
    }
});