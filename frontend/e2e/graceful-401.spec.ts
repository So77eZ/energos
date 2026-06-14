import { test, expect, type APIRequestContext } from '@playwright/test'

// Грейсфул-401: страница логина показывает баннер при ?expired=1 и уважает
// (санитизируя) ?return=. Полный mid-session редирект (клик → 401 → логин)
// не воспроизводится без форс-401 на бэке — проверяется вручную (см. план §6).
//
// Guest-проект (без storageState): тестируем сам логин-флоу.

const E2E_USERNAME = process.env.E2E_USERNAME ?? 'playwright_e2e'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'PlayE2E_2026'
const API_ROOT = process.env.E2E_API_ROOT ?? 'http://localhost'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

/** Регистрируем e2e-юзера (идемпотентно: 400/409 если уже есть). */
async function ensureUser(request: APIRequestContext): Promise<void> {
  await request.post(`${API_ROOT}/api/auth/register/`, {
    data: { username: E2E_USERNAME, password: E2E_PASSWORD },
    headers: { 'Content-Type': 'application/json' },
    failOnStatusCode: false,
  })
}

async function loginViaForm(page: import('@playwright/test').Page): Promise<void> {
  await page.fill('input[name="username"]', E2E_USERNAME)
  await page.fill('input[name="password"]', E2E_PASSWORD)
  await page.click('button[type="submit"]')
}

test.describe('грейсфул-401: логин-баннер + return-to', () => {
  test('?expired=1 → баннер «Сессия истекла»', async ({ page }) => {
    await page.goto('/auth/login?expired=1')
    const notice = page.locator('.auth-notice')
    await expect(notice).toBeVisible()
    await expect(notice).toContainText('Сессия истекла')
  })

  test('без ?expired — баннера нет', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('.auth-notice')).toHaveCount(0)
  })

  test('вход с ?return=/tier → приземление на /tier', async ({ page, request }) => {
    await ensureUser(request)
    await page.goto('/auth/login?return=/tier')
    await loginViaForm(page)
    await expect(page).toHaveURL(/\/tier$/)
  })

  test('вход с ?return=//evil.com → НЕ уводит на чужой origin (на /)', async ({ page, request }) => {
    await ensureUser(request)
    await page.goto('/auth/login?return=//evil.com')
    await loginViaForm(page)
    // open-redirect заблокирован safeReturnPath на чтении → дефолт '/'
    await expect(page).toHaveURL(/localhost(:\d+)?\/$/)
    expect(page.url()).not.toContain('evil.com')
  })

  // mid-session форс-401: реальный логин → подмена куки на битый токен (PRESENT,
  // но invalid — клиентский userId из SSR остаётся, гард userId==null не ловит) →
  // клик authed-экшена → бэк 401 → SessionExpiredError → clear+redirect.
  test('клик избранного на битом токене → редирект на логин с баннером', async ({ page, context, request }) => {
    await ensureUser(request)
    await page.goto('/auth/login')
    await loginViaForm(page)
    await expect(page).toHaveURL(/localhost(:\d+)?\/$/) // приземлились на home

    const fav = page.locator('.card-fav').first()
    await fav.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {})
    test.skip(!(await fav.isVisible().catch(() => false)), 'Каталог пуст — нет .card-fav')

    const origin = new URL(page.url()).origin + '/'
    await context.addCookies([
      { name: 'auth_token', value: 'garbage.invalid.token', url: origin, httpOnly: true, sameSite: 'Lax' },
    ])

    await fav.click()
    await expect(page).toHaveURL(/\/auth\/login\?.*expired=1/)
    await expect(page.locator('.auth-notice')).toBeVisible()
  })
})
