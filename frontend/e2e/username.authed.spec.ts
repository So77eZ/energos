import { test, expect, type Page } from '@playwright/test'

// Смена ника в профиле: новое имя сразу видно в профиле и в шапке; чужое имя — ошибка.
// В конце возвращает исходное имя.

const API_ROOT = process.env.E2E_API_ROOT ?? 'http://localhost'
// Второй пользователь, чьё имя заведомо занято. Регистрация идемпотентна: «уже есть» — тоже ок.
const TAKEN = { email: 'playwright_taken@example.com', password: 'PlayTaken_2026', username: 'playwright_taken' }

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

async function rename(page: Page, name: string) {
  await page.getByRole('button', { name: 'Изменить имя' }).click()
  await page.getByLabel('Новое имя').fill(name)
  await page.getByRole('button', { name: 'Сохранить' }).click()
}

test('ник меняется в профиле и шапке, занятый — ошибка', async ({ page, request }) => {
  await request.post(`${API_ROOT}/api/v1/auth/register`, { data: TAKEN, failOnStatusCode: false })

  await page.goto('/profile')
  const name = page.locator('h1.prof-name')
  const original = (await name.innerText()).trim()
  const next = `e2e_${Date.now().toString(36)}`

  await rename(page, next)
  await expect(name).toHaveText(next)
  await expect(page.locator('.nav-avatar-name')).toHaveText(next)
  await page.reload()
  await expect(name).toHaveText(next)

  await rename(page, TAKEN.username)
  await expect(page.locator('.prof-name-error')).toHaveText('Это имя уже занято, выберите другое')
  await page.getByRole('button', { name: 'Отменить' }).click()
  await expect(name).toHaveText(next)

  await rename(page, original)
  await expect(name).toHaveText(original)
})
