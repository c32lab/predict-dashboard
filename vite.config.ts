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
})
