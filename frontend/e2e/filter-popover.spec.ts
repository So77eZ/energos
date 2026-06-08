import { test, expect, type Page } from '@playwright/test'

// Регресс на баг: фильтр-поповер был привязан только к SortBar (position:absolute).
// Хедер-кнопка фильтра тогглила тот же стейт → при скролле вниз (SortBar за кадром)
// поповер рендерился за верхом вьюпорта. Фикс: у хедер-кнопки свой co-located
// поповер под sticky-шапкой. (PR: fix/filter-popover-anchor)

test.beforeEach(async ({ context }) => {
  // Dev-сервер компилит роут на первом запросе прогона — запас сверх дефолта.
  test.setTimeout(70_000)
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

// goto + дождаться отрисованного каталога (commit поглощает dev-компиляцию,
// toBeVisible — SSR-рендер/гидрацию).
async function gotoHome(page: Page) {
  await page.goto('/', { waitUntil: 'commit', timeout: 60_000 })
  await expect(page.locator('.sortbar')).toBeVisible({ timeout: 20_000 })
}

const popTop = (page: Page) =>
  page.locator('.filter-pop').evaluate((el) => el.getBoundingClientRect().top)

test.describe('filter-popover: хедер-триггер', () => {
  test('клик хедер-фильтра при скролле вниз → поповер в зоне видимости', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoHome(page)

    // Уводим SortBar за верх вьюпорта.
    await page.evaluate(() => window.scrollTo(0, 1500))
    await expect
      .poll(() => page.locator('.sortbar').evaluate((el) => el.getBoundingClientRect().bottom), { timeout: 3000 })
      .toBeLessThan(0)

    // Открываем фильтр из sticky-шапки.
    await page.locator('.hdr-filter-btn').click()
    await expect(page.locator('.filter-pop')).toBeVisible()

    // Поповер в пределах вьюпорта по вертикали, а не за кадром сверху.
    const top = await popTop(page)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThan(720)
  })

  test('клик хедер-фильтра у верха страницы → тоже в зоне видимости', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await gotoHome(page)

    await page.locator('.hdr-filter-btn').click()
    await expect(page.locator('.filter-pop')).toBeVisible()

    const top = await popTop(page)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThan(720)
  })
})
