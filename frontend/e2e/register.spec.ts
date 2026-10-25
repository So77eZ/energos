import { test, expect } from '@playwright/test'

// После регистрации — сообщение «подтвердите e-mail» с адресом, а не молчаливый переход на главную.
// Guest-проект: каждый прогон регистрирует нового пользователя.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

test('регистрация → просьба подтвердить e-mail', async ({ page }) => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const email = `reg_${id}@example.com`

  await page.goto('/auth/register')
  const main = page.getByRole('main')
  await main.locator('input[name="username"]').fill(email)
  await main.locator('input[name="nickname"]').fill(`reg_${id}`)
  await main.locator('input[name="password"]').fill('RegE2E_2026!')
  await main.locator('input[name="confirm"]').fill('RegE2E_2026!')
  await main.locator('button[type="submit"]').click()

  const notice = main.getByRole('status')
  await expect(notice).toContainText('Аккаунт создан')
  await expect(notice).toContainText(email)
  await expect(main.getByRole('link', { name: /На главную/ })).toBeVisible()
})
