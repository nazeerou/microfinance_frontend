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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group ALL Vue-related packages together to avoid circular deps
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vendor-vue' // Single chunk for all Vue code
            }
            // Lodash can stay separate
            if (id.includes('lodash')) {
              return 'vendor-lodash'
            }
            // Everything else
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
