import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

// Smoke-набор: проверяет что ключевые роуты рендерятся без runtime-ошибок
// и базовая интерактивность работает. Не требует авторизации / тестовых данных
// в БД — устойчив к пустому каталогу и недоступному бэку.

// AgeGate-модалка появляется на каждом первом заходе и перехватывает клики.
// Подсовываем флаг в localStorage ДО загрузки страницы, чтобы она не открывалась.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

/** Накопитель сообщений из browser console — failTest() в afterEach если были errors. */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Game over warnings от Next dev про missing fonts/etc — игнорируем.
      // Прода они уйдут.
      if (text.includes('Failed to load resource')) return
      errors.push(text)
    }
  })
  page.on('pageerror', (err) => {
    errors.push(`pageerror: ${err.message}`)
  })
  return errors
}

test.describe('smoke: основные роуты грузятся без runtime-ошибок', () => {
  test('главная — рендерит каталог + tweaks-fab', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/')
    // page-home — корневой враппер главной
    await expect(page.locator('.page-home')).toBeVisible()
    // TweaksPanel-fab всегда виден внизу справа
    await expect(page.locator('.twk-fab')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/auth/login — форма видна', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/auth/login')
    await expect(page.locator('.page-auth')).toBeVisible()
    await expect(page.locator('input[name="username"], input#username')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/profile без авторизации → редирект на /auth/login', async ({ page }) => {
    await page.goto('/profile')
    // Server-side redirect: к моменту load уже на login.
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('/compare — пустое состояние или picker', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/compare')
    // page-compare содержит либо empty-state, либо picker с напитками — оба
    // случая считаем успешным рендером.
    await expect(page.locator('.page-compare')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/tier — страница tier-list рендерится', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/tier')
    await expect(page.locator('h1')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('/glossary — словарь рендерится', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/glossary')
    await expect(page.locator('h1')).toBeVisible()
    expect(errors).toEqual([])
  })
})

test.describe('smoke: интерактивные элементы каталога', () => {
  test('view-switch переключает grid ↔ heatmap', async ({ page }) => {
    await page.goto('/')
    // Если каталог пустой, контейнеры grid/heatmap не появятся — пропускаем тест.
    const hasData = await page.locator('.grid-regular, .heatmap').first().isVisible().catch(() => false)
    test.skip(!hasData, 'Каталог пуст — тест переключения вида неприменим')

    // По умолчанию — сетка карточек
    await expect(page.locator('.grid-regular')).toBeVisible()
    // Кликаем 2-ю кнопку view-switch (layers/heat)
    await page.locator('.view-switch button').nth(1).click()
    await expect(page.locator('.heatmap')).toBeVisible()
    // Обратно на grid
    await page.locator('.view-switch button').nth(0).click()
    await expect(page.locator('.grid-regular')).toBeVisible()
  })

  test('filter-popover открывается и закрывается по Esc', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.sortbar')).toBeVisible()
    // Открываем
    await page.locator('.filter-btn').click()
    await expect(page.locator('.filter-pop')).toBeVisible()
    // Esc закрывает
    await page.keyboard.press('Escape')
    await expect(page.locator('.filter-pop')).not.toBeVisible()
  })

  test('TweaksPanel открывается из fab и содержит секции', async ({ page }) => {
    await page.goto('/')
    await page.locator('.twk-fab').click()
    await expect(page.locator('.twk-panel')).toBeVisible()
    // Проверяем что все 4 секции есть (Тема/Акцент/Шрифт/Эффекты)
    const titles = page.locator('.twk-section-title')
    await expect(titles).toHaveCount(4)
  })
})
