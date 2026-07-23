import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts')) return 'charts'
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    // Allow Google OAuth popup postMessage through COOP
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/create-order': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
