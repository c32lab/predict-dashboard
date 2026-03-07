import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'e2e/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/setupTests.ts',
        '**/__tests__/**',
        '*.config.{ts,js,mjs}',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
        'eslint.config.js',
        '**/*.d.ts',
      ],
    },
  },
})
