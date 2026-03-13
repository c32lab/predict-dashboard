import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8082,
    proxy: {
      '/api': 'http://localhost:8092',
    },
  },
  preview: {
    port: 8082,
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
