import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // Frontend port as per prompt (implicitly)
    proxy: {
      // Proxy API requests to Supabase Edge Functions (running on default 54321/functions/v1)
      // This might need adjustment based on how Supabase Edge Functions are served locally
      '/api': {
        target: 'http://localhost:54321/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
