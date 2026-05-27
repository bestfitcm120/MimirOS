import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Only used during `npm run dev` (local development without Docker).
    // In production (Docker), nginx proxies /api to the backend container.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Chunk vendor libs separately for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          flow:   ['reactflow'],
          motion: ['framer-motion'],
          query:  ['@tanstack/react-query'],
        },
      },
    },
  },
})
