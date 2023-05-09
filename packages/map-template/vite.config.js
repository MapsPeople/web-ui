import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';

export default defineConfig(() => {
    return {
        server: {
            port: 3000
        },
        build: {
            outDir: 'build'
        },
        plugins: [
           react(),
           svgr({
            svgrOptions: {}
           }),
           eslint()
        ]
    }
});