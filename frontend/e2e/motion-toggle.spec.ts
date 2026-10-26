import { test, expect } from '@playwright/test'

// Анимации: Вкл/Выкл. Пока не выбрано — по системе («уменьшить движение» → выкл.);
// выбор сохраняется и бьёт системную настройку.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      localStorage.setItem('energos_age_verified', 'true')
      localStorage.setItem('energos_analytics_consent', 'denied')
    } catch {}
  })
})

test('по умолчанию — как система; «Вкл.» сохраняется после перезагрузки', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-motion', 'off')

  await page.getByRole('button', { name: /настройки|оформление/i }).first().click()
  const seg = page.getByRole('radiogroup', { name: 'Анимации' }).first()
  await expect(seg.getByRole('radio', { name: 'Выкл.' })).toHaveAttribute('aria-checked', 'true')

  await seg.getByRole('radio', { name: 'Вкл.' }).click()
  await expect(html).toHaveAttribute('data-motion', 'on')

  await page.reload()
  await expect(html).toHaveAttribute('data-motion', 'on')
})
