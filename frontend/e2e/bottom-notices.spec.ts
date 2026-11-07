import { test, expect } from '@playwright/test'

// Баннер Метрики и плашка «анимации урезаны» — оба внизу экрана. Плашка ждёт ответа на баннер,
// иначе перекрывает его кнопки.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

test('плашка про анимации появляется только после ответа на баннер Метрики', async ({ page }) => {
  await page.goto('/')
  const consent = page.getByRole('dialog', { name: 'Согласие на аналитику' })
  const motionNotice = page.getByRole('status').filter({ hasText: 'Часть анимаций' })

  await expect(consent).toBeVisible()
  await expect(motionNotice).toHaveCount(0)

  await consent.getByRole('button', { name: 'Отклонить' }).click()

  await expect(consent).toHaveCount(0)
  await expect(motionNotice).toBeVisible()
})

test.describe('узкий экран', () => {
  test.use({ viewport: { width: 320, height: 800 } })

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('energos_analytics_consent', 'denied')
    })
  })

  test('плашка анимаций использует доступную ширину', async ({ page }) => {
    await page.goto('/')
    const notice = page.locator('.motion-notice')
    await expect(notice).toBeVisible()
    const box = await notice.boundingBox()
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)

    expect(box!.width).toBeGreaterThanOrEqual(260)
    expect(box!.height).toBeLessThan(160)
    expect(box!.x).toBeGreaterThanOrEqual(16)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth - 16)
  })

  test('панель помещается в экран, а плашка не перекрывает настройки', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.motion-notice')).toBeVisible()
    await page.getByRole('button', { name: 'Настройки темы', exact: true }).click()
    const panel = page.getByRole('dialog', { name: 'Настройки внешнего вида' })
    await expect(panel).toBeVisible()
    await expect(page.locator('.motion-notice')).toBeHidden()
    const box = await panel.boundingBox()
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)

    expect(box!.x).toBeGreaterThanOrEqual(16)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth - 16)
    await panel.getByRole('button', { name: 'Закрыть', exact: true }).click()
    await expect(page.locator('.motion-notice')).toBeVisible()
    await page.getByRole('button', { name: 'Настройки темы', exact: true }).click()
    await panel.getByRole('link', { name: 'Все настройки оформления' }).click()
    await expect(page).toHaveURL('/auth/login?return=%2Fprofile%3Ftab%3Dappearance')
    await expect(panel).toBeHidden()
  })
})
