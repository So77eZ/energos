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
  await expect(panel.getByRole('radio', { name: 'Сладость: минимум 4', exact: true })).toBeChecked()
  await panel.getByRole('radio', { name: 'Сладость: минимум 3', exact: true }).check()
  await expect(page).toHaveURL(/taste_sweetness=3-5/)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await trigger.click()
  await expect(panel.getByRole('radio', { name: 'Сладость: минимум 3', exact: true })).toBeChecked()
  await panel.getByRole('button', { name: 'Сбросить все' }).click()
  await expect(page).not.toHaveURL(/taste_sweetness/)
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('radio', { name: 'Сладость: минимум 1', exact: true })).toBeChecked()
  await expect(panel.getByRole('radio', { name: 'Сладость: максимум 5', exact: true })).toBeChecked()
  expect(errors).toEqual([])
})

test('score buttons support arrows and keep crossed taste bounds valid', async ({ page }) => {
  await page.goto('/?taste_sweetness=3-4', { waitUntil: 'domcontentloaded' })
  await page.locator('.sortbar .filter-btn:visible').click()
  const panel = page.locator('.filter-pop:visible')
  const minimum = panel.getByRole('radio', { name: 'Сладость: минимум 3', exact: true })
  await minimum.focus()
  await minimum.press('ArrowRight')
  await expect(panel.getByRole('radio', { name: 'Сладость: минимум 4', exact: true })).toBeChecked()
  await expect(page).toHaveURL(/taste_sweetness=4-4/)
  await page.keyboard.press('ArrowRight')
  await expect(panel.getByRole('radio', { name: 'Сладость: максимум 5', exact: true })).toBeChecked()
  await expect(page).toHaveURL(/taste_sweetness=5-5/)
  await panel.getByRole('radio', { name: 'Сладость: максимум 2', exact: true }).check()
  await expect(panel.getByRole('radio', { name: 'Сладость: минимум 2', exact: true })).toBeChecked()
  await expect(page).toHaveURL(/taste_sweetness=2-2/)
  await expect(panel.getByRole('radio', { name: 'Кислотность: минимум 1', exact: true })).toBeChecked()
  await expect(panel.getByRole('radio', { name: 'Сладость: максимум 2', exact: true }).locator('..').locator('svg')).toHaveCount(1)
})

for (const theme of ['dark', 'light']) {
  test(`score buttons fit narrow and desktop panels in ${theme} theme`, async ({ context, page }, testInfo) => {
    await context.addInitScript((theme) => {
      localStorage.setItem('energos_theme', JSON.stringify({ theme, accent: 'cyan', motion: 'off' }))
      localStorage.setItem('energos_gfx', 'low')
      localStorage.setItem('energos_motion_notice', 'dismissed')
    }, theme)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      const trigger = page.locator('.sortbar .filter-btn:visible')
      await trigger.evaluate(element => window.scrollBy(0, element.getBoundingClientRect().top - 120))
      await trigger.click()
      const panel = page.locator('.filter-pop:visible')
      await expect(page.locator('.twk-fab')).toBeHidden()
      await expect(page.locator('.up-fab')).toBeHidden()
      await expect(panel.getByRole('radio')).toHaveCount(60)
      await expect(panel.locator('select')).toHaveCount(0)
      const targets = await panel.locator('.filt-score').evaluateAll(labels => labels.map(label => {
        const bounds = label.getBoundingClientRect()
        return { width: bounds.width, height: bounds.height }
      }))
      // Translated boxes can report 43.9999px for a 44px CSS target.
      expect(Math.min(...targets.map(target => target.width))).toBeGreaterThanOrEqual(43.99)
      expect(Math.min(...targets.map(target => target.height))).toBeGreaterThanOrEqual(43.99)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (width === 320) {
        const bar = await page.locator('.mob-tabs:visible').boundingBox()
        const bounds = await panel.boundingBox()
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(bar!.y)
      }
      await panel.screenshot({ path: testInfo.outputPath(`filter-scores-${theme}-${width}.png`) })
      await panel.getByRole('radio', { name: 'Цена/качество: максимум 3', exact: true }).check()
      await expect(page).toHaveURL(/taste_price_quality=1-3/)
      await panel.getByRole('button', { name: 'Сбросить все' }).click()
      await expect(panel).toBeVisible()
      await expect(panel.getByRole('radio', { name: 'Цена/качество: максимум 5', exact: true })).toBeChecked()
      await page.keyboard.press('Escape')
      await expect(page.locator('.twk-fab')).toBeVisible()
    }
  })
}

test('reset keeps the filters open; outside click and Escape still close them', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const trigger = page.locator('.sortbar .filter-btn:visible')
  const panel = page.locator('.filter-pop:visible')
  await trigger.click()
  await panel.getByRole('button', { name: 'A', exact: true }).click()
  await panel.getByText('Без сахара', { exact: true }).click()
  await panel.getByRole('button', { name: 'Сбросить все' }).click()
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('button', { name: 'A', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(panel.getByLabel('Без сахара')).not.toBeChecked()
  await expect(panel.getByRole('button', { name: 'Сбросить все' })).toHaveCount(0)

  await page.locator('.filter-pop-title:visible').click()
  await expect(panel).toBeVisible()
  await page.locator('.logo:visible').click()
  await expect(panel).toHaveCount(0)
  await trigger.click()
  await expect(panel).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
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
