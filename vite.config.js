import { defineConfig } from 'vite'

export default defineConfig({
    css: {
        devSourcemap: true,
        cssCodeSplit: true
    },
    build: {
        outDir: 'dist'
    }
})