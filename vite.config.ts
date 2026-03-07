import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 18828,
    proxy: {
      '/api': 'http://localhost:18801',
    },
  },
  preview: {
    port: 18828,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-swr': ['swr'],
          'vendor-xyflow': ['@xyflow/react'],
        },
      },
    },
  },
})
