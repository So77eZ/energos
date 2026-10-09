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

// Фичи, которых нет в API ветки mvp, выключены флагами (src/shared/config/features.ts).
// Спеки читают те же NEXT_PUBLIC_FF_* — запускать с теми же значениями, что и сборку фронта.
const ff = (name: string) => ['1', 'true'].includes(process.env[`NEXT_PUBLIC_FF_${name}`] ?? '')

test('/profile открывается под логином, видны вкладки включённых фич', async ({ page }) => {
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/profile/)
  await expect(page.locator('.prof-tabs')).toBeVisible()
  // reviews (reviewAuthors), favorites, submissions, achievements — по флагам; appearance всегда.
  const expected = 1 + ['REVIEW_AUTHORS', 'FAVORITES', 'SUBMISSIONS', 'ACHIEVEMENTS'].filter(ff).length
  await expect(page.locator('.prof-tab')).toHaveCount(expected)
})

test('/profile?tab=appearance показывает TweaksBody', async ({ page }) => {
  await page.goto('/profile?tab=appearance')
  await expect(page.locator('.prof-appearance')).toBeVisible()
  // Внутри 4 секции из TweaksBody
  await expect(page.locator('.prof-appearance .twk-section-title')).toHaveCount(4)
})

test('/submit без флага submissions → 404', async ({ page }) => {
  test.skip(ff('SUBMISSIONS'), 'Фича включена — проверяется тестом ниже')
  const res = await page.goto('/submit')
  expect(res?.status()).toBe(404)
})

test('/submit форма заявки видна под логином', async ({ page }) => {
  test.skip(!ff('SUBMISSIONS'), 'Флаг submissions выключен (нет /add-requests в API)')
  await page.goto('/submit')
  // Видна сама форма (не gate "нужно войти"). Поле названия — по placeholder.
  await expect(page.locator('input[placeholder*="BURN" i]')).toBeVisible()
})

test('favorites toggle — клик ⚡ на карточке добавляет в избранное', async ({ page }) => {
  test.skip(!ff('FAVORITES'), 'Флаг favorites выключен (нет избранного в API)')
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
  test.skip(!ff('EMOJI_REACTIONS'), 'Флаг emojiReactions выключен (нет реакций в API)')
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
