import { test, expect } from '@playwright/test'

// Проверяет фичу «скролл к каталогу при вводе поиска» (PR #15):
//  • десктоп — непустой поиск скроллит .cat-anchor (SortBar) под sticky-шапку,
//    очистка возвращает наверх;
//  • мобайл (≤640) — поиск живёт в оверлее с useScrollLock, который при закрытии
//    делает scrollTo(0, scrollY); скролл к каталогу не доживает → desktop-only.
//    (см. gotcha_mobile_overlay_scroll_lock в памяти)

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('energos_age_verified', 'true') } catch {}
  })
})

const scrollY = (page: import('@playwright/test').Page) => page.evaluate(() => window.scrollY)
const anchorTop = (page: import('@playwright/test').Page) =>
  page.locator('.cat-anchor').evaluate((el) => Math.round(el.getBoundingClientRect().top))

test.describe('search-scroll: десктоп', () => {
  test('ввод поиска → .cat-anchor под шапку; очистка → вверх', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    const anchor = page.locator('.cat-anchor')
    const hasAnchor = await anchor.isVisible().catch(() => false)
    test.skip(!hasAnchor, 'Каталог пуст — .cat-anchor нет, тест неприменим')

    // Исходно — наверху страницы, якорь ниже сгиба (под hero/stats).
    expect(await scrollY(page)).toBe(0)
    const beforeTop = await anchorTop(page)
    test.skip(beforeTop <= 130, 'Якорь уже под шапкой (короткая страница) — скролл неинформативен')

    // Ввод поиска → плавный скролл к якорю.
    await page.locator('#header-search').fill('tor')
    await expect.poll(() => anchorTop(page), { timeout: 5000 }).toBeLessThanOrEqual(130)

    const settled = await anchorTop(page)
    expect(settled).toBeGreaterThan(50)   // не срезан под фиксированную шапку
    expect(await scrollY(page)).toBeGreaterThan(0)

    // Очистка → возврат наверх.
    await page.locator('#header-search').fill('')
    await expect.poll(() => scrollY(page), { timeout: 5000 }).toBeLessThan(5)
  })
})

test.describe('search-scroll: мобайл (≤640) — desktop-only', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('коммит поиска в оверлее НЕ скроллит к каталогу (scroll-lock откатывает наверх)', async ({ page }) => {
    await page.goto('/')
    expect(await scrollY(page)).toBe(0)

    // Мобильный поиск — полноэкранный оверлей (useScrollLock пинит body).
    await page.locator('.hdr-mobile-search').click()
    const input = page.locator('.mob-search input')
    await expect(input).toBeVisible()
    await input.fill('tor')

    // Enter коммитит и закрывает оверлей → useScrollLock cleanup: scrollTo(0, 0).
    await input.press('Enter')
    await expect(page.locator('.mob-search')).toBeHidden()

    // Поиск применился (значение пережило закрытие), но позиция = верх:
    // scroll-to-catalog на мобиле не доживает.
    await expect.poll(() => scrollY(page), { timeout: 3000 }).toBe(0)
  })
})
