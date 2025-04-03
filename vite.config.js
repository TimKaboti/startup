import { defineConfig } from 'vite';

export default defineConfig({
    css: {
        devSourcemap: true,
        cssCodeSplit: true,
    },
    build: {
        outDir: 'dist',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false,
            },
            // 🔥 WebSocket proxy
            '^/socket': {
                target: 'ws://localhost:4000',
                ws: true,
            },
        },
    },
});
