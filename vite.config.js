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
                target: 'http://localhost:4000', // Forward API requests to the backend
                changeOrigin: true, // Ensure the host header matches the target
                secure: false, // Disable SSL verification (useful for local development)
            },
        },
    },
});
