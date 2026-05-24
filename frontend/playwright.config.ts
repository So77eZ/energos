import { defineConfig, devices } from '@playwright/test'

// Smoke-тесты — проходят по ключевым роутам и проверяют что страницы
// рендерятся без runtime-ошибок. Не требуют backend/login (см. e2e/smoke.spec.ts).
//
// Запуск:  npm run test:e2e
// Запуск с UI: npx playwright test --ui

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // 1) Guest-режим: smoke без авторизации.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /authed\.spec\.ts/,
    },
    // 2) Setup-проект — готовит storageState для авторизованных тестов.
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // 3) Authed-проект: depends на setup, грузит storageState.
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /authed\.spec\.ts/,
    },
  ],

  // Поднимаем dev-server автоматически если он не запущен.
  // reuseExistingServer:true — если кто-то уже запустил `npm run dev`,
  // тесты прицепятся к нему и не будут пытаться поднять второй.
  // API_ORIGIN — куда rewrite'ить /api/*. По умолчанию http://localhost:8000,
  // но если бэк запущен только в docker'е — он там не доступен с хоста.
  // Caddy на :80 проксирует /api на backend → используем его.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      API_ORIGIN: process.env.API_ORIGIN ?? 'http://localhost',
    },
  },
})
