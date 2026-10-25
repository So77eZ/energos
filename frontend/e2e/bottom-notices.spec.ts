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
