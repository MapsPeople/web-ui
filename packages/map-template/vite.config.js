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
        },
        plugins: [
            react(),
            svgr(),
            ViteFaviconsPlugin('./public/favicon.png'),
            eslint(),
            sentryVitePlugin({
                org: 'mapspeople-gx',
                project: 'map-mapsindoors',
          
                // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
                authToken: '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',
                reactComponentAnnotation: { enabled: true },
            }),
        ]
    }
});