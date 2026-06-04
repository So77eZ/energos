import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  return errors
}

test.describe('nav: desktop priority+', () => {
  test('широкий экран — все пункты, «Ещё» не нужен; нет console-ошибок (ловит RO-loop)', async ({ page }) => {
    const errors = trackErrors(page)
    await page.setViewportSize({ width: 1500, height: 900 })
    await page.goto('/')
    await expect(page.locator('.hdr-nav-flow')).toBeVisible()
    await page.waitForTimeout(500)
    expect(errors).toEqual([])
  })

  test('узкий экран — часть пунктов уходит в «Ещё»', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 })
    await page.goto('/')
    const more = page.locator('.hdr-more-btn').first()
    await expect(more).toBeVisible()
    await more.click()
    await expect(page.locator('.hdr-more-menu .hdr-more-item').first()).toBeVisible()
  })
})

test.describe('nav: mobile (≤640)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('bottom-tabs видны, desktop-nav скрыт', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.mob-tabs')).toBeVisible()
    await expect(page.locator('.hdr-nav')).toBeHidden()
  })

  test('бургер открывает sheet, Esc закрывает', async ({ page }) => {
    await page.goto('/')
    await page.locator('.hdr-mobile-menu').click()
    await expect(page.locator('.mob-sheet')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.mob-sheet')).toBeHidden()
  })

  test('иконка поиска открывает overlay с рабочим input', async ({ page }) => {
    await page.goto('/')
    await page.locator('.hdr-mobile-search').click()
    await expect(page.locator('.mob-search input')).toBeVisible()
    await page.locator('.mob-search input').fill('test')
    await expect(page.locator('.mob-search input')).toHaveValue('test')
  })
})
