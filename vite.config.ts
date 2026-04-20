import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  // Add the 'build' section below
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create a 'vendor' chunk for all code in node_modules
          if (id.includes('node_modules')) {
            // Further split large libraries into their own chunks
            if (id.includes('lodash')) {
              return 'vendor-lodash'
            }
            if (id.includes('@vue/reactivity')) {
              return 'vendor-vue-reactivity'
            }
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vendor-vue'
            }
            // All other node_modules go into a 'vendor' chunk
            return 'vendor'
          }
        },
      },
    },
    // Optional: Increase the warning limit to 1000 kB
    chunkSizeWarningLimit: 2000,
  },
})
