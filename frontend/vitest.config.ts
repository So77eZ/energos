import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Только pure-логика (node env). DOM/компоненты тестируются через Playwright e2e.
// Тест-файлы — рядом с исходниками (*.test.ts). e2e/ исключён (там Playwright).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@widgets': resolve(__dirname, 'src/widgets'),
      '@features': resolve(__dirname, 'src/features'),
    },
  },
})
