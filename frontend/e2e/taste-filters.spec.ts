import { expect, test } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('energos_age_verified', 'true')
    localStorage.setItem('energos_analytics_consent', 'denied')
  })
})

test('taste ranges survive reload and reset without header hydration errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/?taste_sweetness=4-5', { waitUntil: 'domcontentloaded' })
  const trigger = page.locator('.sortbar .filter-btn:visible')
  const panel = page.locator('.filter-pop:visible')
  await trigger.click()
  await expect(panel.getByLabel('Сладость: минимум')).toHaveValue('4')
  await panel.getByLabel('Сладость: минимум').selectOption('3')
  await expect(page).toHaveURL(/taste_sweetness=3-5/)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await trigger.click()
  await expect(panel.getByLabel('Сладость: минимум')).toHaveValue('3')
  await panel.getByRole('button', { name: 'Сбросить все' }).click()
  await expect(page).not.toHaveURL(/taste_sweetness/)
  expect(errors).toEqual([])
})

test('expanded filters fit the mobile viewport above and below the trigger', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const trigger = page.locator('.sortbar .filter-btn:visible')
  await expect(trigger).toBeVisible()
  for (const top of [400, 700]) {
    await trigger.evaluate((element, target) => window.scrollBy(0, element.getBoundingClientRect().top - target), top)
    // Preserve the actual trigger position instead of Playwright auto-scrolling it.
    await trigger.dispatchEvent('click')
    await expect(page.locator('.filter-pop:visible')).toBeVisible()
    await expect.poll(async () => {
      const bounds = await page.locator('.filter-pop:visible').boundingBox()
      return !!bounds && bounds.y >= 0 && bounds.y + bounds.height <= 800
    }).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.locator('.filter-pop')).toBeHidden()
  }
})
