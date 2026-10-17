import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

// Регрессия: после создания/удаления отзыва страница напитка до 60 с показывала старый счётчик.
// Бэк коммитил транзакцию уже после ответа на POST/DELETE, фронт сразу после updateTag('reviews')
// перечитывал список, получал данные до записи и клал их в Data Cache на revalidate: 60.
// Нужен подтверждённый e-mail (иначе форма отзыва не открывается): E2E_USERNAME/E2E_PASSWORD.
// Тест сам оставляет отзыв и сам его удаляет.

const API_ROOT = process.env.E2E_API_ROOT ?? 'http://localhost'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

// Внутри <main>: пока страница стримится, рядом лежит скрытая копия разметки (буфер Suspense).
const reviewsCount = (page: Page) =>
  page.locator('main .meta-cell', { has: page.locator('.meta-lbl', { hasText: 'ОТЗЫВОВ' }) }).locator('.meta-val')

type ApiDrink = { id: number; reviews_count: number }
const apiDrinks = async (request: APIRequestContext) =>
  (await (await request.get(`${API_ROOT}/api/v1/energy-drinks/?limit=100&offset=0`)).json()) as ApiDrink[]
const apiCount = async (request: APIRequestContext, id: number) =>
  String((await apiDrinks(request)).find((d) => d.id === id)?.reviews_count)

// Быстрее, чем revalidate: 60 у списка напитков, — иначе тест прошёл бы «по таймеру».
const FRESH = { timeout: 10_000 }

test('счётчик отзывов обновляется сразу после создания и удаления отзыва', async ({ page, request }) => {
  const [drink] = await apiDrinks(request)
  test.skip(!drink, 'Каталог пуст')
  const url = `/drinks?id=${drink.id}`

  await page.goto(url)
  const writeBtn = page.getByRole('button', { name: 'Оставить отзыв' })
  test.skip(!(await writeBtn.isVisible()), 'У e2e-юзера уже есть отзыв на напиток или он не залогинен')

  // Создание: форма → server action → updateTag + redirect обратно на страницу напитка.
  await writeBtn.click()
  for (const row of await page.locator('.rate-row').all()) {
    await row.locator('.rate-btn').nth(3).click()
  }
  await page.getByRole('button', { name: /Опубликовать отзыв/ }).click()
  await expect(page.locator('.my-review-section')).toBeVisible(FRESH)
  const afterCreate = await apiCount(request, drink.id)
  await expect(reviewsCount(page)).toHaveText(afterCreate, FRESH)

  // Новый запрос страницы тоже видит свежий список (а не только ответ action'а).
  await page.goto(url)
  await expect(reviewsCount(page)).toHaveText(afterCreate, FRESH)

  // Удаление: тот же путь через deleteReviewAction.
  page.once('dialog', (d) => d.accept())
  await page.locator('.my-review-section').getByRole('button', { name: /Удалить/ }).click()
  await expect(page.locator('.my-review-section')).toBeHidden(FRESH)
  const afterDelete = await apiCount(request, drink.id)
  expect(Number(afterDelete)).toBe(Number(afterCreate) - 1)
  await expect(reviewsCount(page)).toHaveText(afterDelete, FRESH)

  await page.goto(url)
  await expect(reviewsCount(page)).toHaveText(afterDelete, FRESH)
})
