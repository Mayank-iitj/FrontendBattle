import { defineConfig } from 'vite'

export default defineConfig({
  // No framework plugins needed — pure Vanilla JS
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into a separate lazy chunk — keeps critical bundle tiny
          three: ['three'],
        },
      },
    },
  },
})
