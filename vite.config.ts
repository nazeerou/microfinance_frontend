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
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // Large libraries get their own chunks
            if (id.includes('lodash')) {
              return 'vendor-lodash'
            }
            if (id.includes('@vue/reactivity')) {
              return 'vendor-vue-reactivity'
            }
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vendor-vue'
            }
            // All other dependencies go to vendor chunk
            return 'vendor'
          }
        },
      },
    },
    // Optional: Increase warning limit if needed (500kb default)
    chunkSizeWarningLimit: 1000,
  },
})
