import { test as setup, expect } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

// Setup-проект: подготавливает авторизованную сессию для authed-spec'ов.
// 1) Пытаемся залогиниться как E2E_USER. Если нет — регистрируем (через
//    /api/auth/register), потом логинимся.
// 2) Из ответа /api/auth/login берём access_token, прокидываем в cookie
//    auth_token (так же как session.ts на сервере) → сохраняем storageState.
// 3) Authed-тесты грузят storageState и работают как залогиненный юзер.

const E2E_USERNAME = process.env.E2E_USERNAME ?? 'playwright_e2e'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'PlayE2E_2026'
const AUTH_FILE = 'e2e/.auth/user.json'
// Бэк бьём напрямую, а не через Next rewrites — Next dev иногда отдаёт HTML
// вместо проксирования на /api/. По умолчанию Caddy на :80, можно переопределить.
const API_ROOT = process.env.E2E_API_ROOT ?? 'http://localhost'

setup('authenticate', async ({ request, context, baseURL }) => {
  const apiBase = API_ROOT

  // 1) Пытаемся залогиниться существующим юзером.
  let token = await tryLogin(request, apiBase, E2E_USERNAME, E2E_PASSWORD)

  // 2) Если 401 — регистрируем и логинимся заново.
  if (!token) {
    const regRes = await request.post(`${apiBase}/api/auth/register/`, {
      data: { username: E2E_USERNAME, password: E2E_PASSWORD },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    })
    if (![201, 200, 409, 400].includes(regRes.status())) {
      // 400/409 — уже существует (тогда login дальше должен сработать); другое — фатально.
      throw new Error(`Регистрация e2e-юзера упала: ${regRes.status()} ${await regRes.text()}`)
    }
    token = await tryLogin(request, apiBase, E2E_USERNAME, E2E_PASSWORD)
  }

  expect(token, 'Не удалось получить токен для e2e-юзера').toBeTruthy()

  // 3) Ставим cookie так же как session.ts.setToken() на сервере. httpOnly+lax+/.
  // url ставим на frontend (baseURL) — там работают тесты, оттуда session.ts читает.
  const cookieUrl = baseURL ?? 'http://localhost:3000'
  await context.addCookies([
    {
      name: 'auth_token',
      value: token!,
      url: cookieUrl,
      httpOnly: true,
      secure: cookieUrl.startsWith('https://'),
      sameSite: 'Lax',
    },
  ])

  mkdirSync(dirname(AUTH_FILE), { recursive: true })
  await context.storageState({ path: AUTH_FILE })
})

async function tryLogin(
  request: import('@playwright/test').APIRequestContext,
  apiBase: string,
  username: string,
  password: string,
): Promise<string | null> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  const res = await request.post(`${apiBase}/api/auth/login/`, {
    data: form.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    failOnStatusCode: false,
  })
  if (!res.ok()) return null
  const text = await res.text()
  try {
    const body = JSON.parse(text) as { access_token?: string }
    return body.access_token ?? null
  } catch {
    // Бэк/прокси отдал не-JSON (HTML страницу Next, или ошибку прокси).
    // Печатаем чтобы было видно в логе теста.
    console.error(`[auth.setup] /api/auth/login/ вернул не-JSON. Status=${res.status()}, body начало:`, text.slice(0, 200))
    return null
  }
}
