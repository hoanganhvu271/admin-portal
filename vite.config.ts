import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/library-api': {
        target: 'http://103.70.115.91:8080',
        changeOrigin: true
      },
      '/model-api': {
        target: 'http://103.70.115.91:8080',
        changeOrigin: true
      }
    }
  }
})