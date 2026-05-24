import { test, expect } from '@playwright/test'

// Тесты под авторизованным юзером. storageState прокидывается из
// auth.setup.ts (см. playwright.config.ts → chromium-auth project).
//
// Тесты толерантны к пустой БД: пропускают себя если нужных данных нет.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

test('/profile открывается под логином, видны все 5 вкладок', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/profile/)
  await expect(page.locator('.prof-tabs')).toBeVisible()
  // 5 вкладок: reviews, favorites, submissions, achievements, appearance
  const tabs = page.locator('.prof-tab')
  await expect(tabs).toHaveCount(5)
})

test('/profile?tab=appearance показывает TweaksBody', async ({ page }) => {
  await page.goto('/profile?tab=appearance')
  await expect(page.locator('.prof-appearance')).toBeVisible()
  // Внутри 4 секции из TweaksBody
  await expect(page.locator('.prof-appearance .twk-section-title')).toHaveCount(4)
})

test('/submit форма заявки видна под логином', async ({ page }) => {
  await page.goto('/submit')
  // Видна сама форма (не gate "нужно войти"). Поле названия — по placeholder.
  await expect(page.locator('input[placeholder*="BURN" i]')).toBeVisible()
})

test('favorites toggle — клик ⚡ на карточке добавляет в избранное', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.page-home')).toBeVisible()

  const firstCard = page.locator('.grid-regular .card').first()
  const hasCards = await firstCard.isVisible().catch(() => false)
  test.skip(!hasCards, 'Каталог пуст — нечего добавить в избранное')

  const favBtn = firstCard.locator('.card-fav')
  const wasActive = await favBtn.evaluate((el) => el.classList.contains('is-fav'))

  await favBtn.click()
  // Ждём перехода состояния (оптимистично + server action).
  if (wasActive) {
    await expect(favBtn).not.toHaveClass(/is-fav/)
  } else {
    await expect(favBtn).toHaveClass(/is-fav/)
  }

  // Возвращаем как было, чтобы не оставлять артефактов в БД.
  await favBtn.click()
  if (wasActive) {
    await expect(favBtn).toHaveClass(/is-fav/)
  } else {
    await expect(favBtn).not.toHaveClass(/is-fav/)
  }
})

test('emoji-реакция — добавление и удаление через picker', async ({ page }) => {
  // Идём на drink-страницу первого напитка из каталога.
  await page.goto('/')
  const firstCard = page.locator('.grid-regular .card').first()
  const hasCards = await firstCard.isVisible().catch(() => false)
  test.skip(!hasCards, 'Каталог пуст — emoji-тест неприменим')

  await firstCard.click()
  await expect(page).toHaveURL(/\/drinks/)

  // Ищем первый EmojiBar (под любым отзывом).
  const emojiBar = page.locator('.emoji-bar').first()
  const hasReviews = await emojiBar.isVisible().catch(() => false)
  test.skip(!hasReviews, 'У напитка нет отзывов — emoji-тест неприменим')

  // Открываем picker, выбираем 🔥.
  await emojiBar.locator('.emoji-add').click()
  await expect(emojiBar.locator('.emoji-picker')).toBeVisible()
  await emojiBar.locator('.emoji-picker-item', { hasText: '🔥' }).click()

  // Проверяем что появился is-mine chip с этим эмодзи.
  const fireChip = emojiBar.locator('.emoji-chip.is-mine', { hasText: '🔥' })
  await expect(fireChip).toBeVisible()

  // Снимаем реакцию обратным кликом.
  await fireChip.click()
  await expect(fireChip).toBeHidden()
})
