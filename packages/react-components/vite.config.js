import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
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
            eslint()
        ]
    }
});
