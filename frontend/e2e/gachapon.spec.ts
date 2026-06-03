import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

// reduced-motion → быстрый спин (0.35s), тесты не ждут 7s.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

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

test.describe('gachapon', () => {
  test('«Ещё» содержит «Рулетка» (gachapon включён по умолчанию) → открывает оверлей → приземление', async ({ page }) => {
    const errors = trackErrors(page)
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/')
    await page.locator('.hdr-more-btn').first().click()
    const roulette = page.locator('.hdr-more-menu .hdr-more-item', { hasText: 'Рулетка' })
    await expect(roulette).toBeVisible()
    await roulette.click()
    await expect(page.locator('.gacha-machine')).toBeVisible()
    // приземление (reduced-motion → быстрый спин)
    await expect(page.locator('.gacha-won-name')).toBeVisible({ timeout: 8000 })
    expect(errors).toEqual([])
  })

  test('«Крутить ещё» запускает новый спин; Esc закрывает', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/')
    await page.locator('.hdr-more-btn').first().click()
    await page.locator('.hdr-more-menu .hdr-more-item', { hasText: 'Рулетка' }).click()
    await expect(page.locator('.gacha-won')).toBeVisible({ timeout: 8000 })
    await page.locator('.gacha-won .cta-ghost').click()
    await expect(page.locator('.gacha-won')).toBeVisible({ timeout: 8000 })
    await page.keyboard.press('Escape')
    await expect(page.locator('.gacha-machine')).toBeHidden()
  })

  test('«Открыть карточку» ведёт на /drinks?id=', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 })
    await page.goto('/')
    await page.locator('.hdr-more-btn').first().click()
    await page.locator('.hdr-more-menu .hdr-more-item', { hasText: 'Рулетка' }).click()
    await expect(page.locator('.gacha-won')).toBeVisible({ timeout: 8000 })
    await page.locator('.gacha-won .cta-primary').click()
    await expect(page).toHaveURL(/\/drinks\?id=\d+/)
  })
})
