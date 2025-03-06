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
            '/api': 'http://localhost:4000',  // Forward API requests to the backend running on port 4000
        },
    },
});
