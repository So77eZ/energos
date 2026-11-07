import { test, expect } from '@playwright/test'

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('energos_age_verified', 'true')
    localStorage.setItem('energos_analytics_consent', 'denied')
    localStorage.setItem('energos_gfx', 'low')
    sessionStorage.getItem('accent-e2e-initialized') || localStorage.removeItem('energos_theme')
    sessionStorage.setItem('accent-e2e-initialized', 'true')
  })
})

test('свой цвет: предпросмотр не сохраняется, применение переживает перезагрузку', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto('/profile?tab=appearance')
  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  await expect(page.locator('.motion-notice')).toBeHidden()
  const hex = page.getByRole('textbox', { name: 'HEX', exact: true })
  await hex.fill('#12001F')
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--accent-fill'))).toBe('#12001F')
  await page.locator('.accent-editor').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('custom-accent-desktop.png') })
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('energos_theme')!).accent)).toBe('cyan')
  await page.getByRole('button', { name: 'Отменить цвет', exact: true }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-accent')

  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  await hex.fill('#12001F')
  await page.getByRole('button', { name: 'Применить цвет', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-custom-accent')
  await page.reload()
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--accent-source'))).toBe('#12001F')
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--on-accent'))).toBe('#FFFFFF')

  await page.getByRole('radio', { name: 'Светлая', exact: true }).click()
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--accent-fill'))).toBe('#12001F')
  await page.getByRole('button', { name: 'Сбросить акцент', exact: true }).click()
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-accent')
})

test('палитра на 320 px: HEX, клавиатура и границы', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/profile?tab=appearance')
  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  const editor = page.getByRole('group', { name: 'Редактор акцента', exact: true })
  const hex = page.getByRole('textbox', { name: 'HEX', exact: true })
  await hex.fill('#12345600')
  await expect(page.getByRole('button', { name: 'Применить цвет', exact: true })).toBeDisabled()
  await hex.fill('#FFFFFF')
  const hue = page.getByRole('slider', { name: 'Оттенок', exact: true })
  await hue.focus()
  await hue.press('ArrowRight')
  await page.getByRole('spinbutton', { name: 'Насыщенность, %', exact: true }).fill('100')
  await expect(hex).not.toHaveValue('#FFFFFF')
  const box = await editor.boundingBox()
  const width = await page.evaluate(() => document.documentElement.clientWidth)
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(width)
  await hex.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('custom-accent-mobile.png') })
  await page.getByRole('button', { name: 'Отменить цвет', exact: true }).click()
})

test('пресет из быстрых настроек отменяет открытый черновик', async ({ page }) => {
  await page.goto('/profile?tab=appearance')
  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  await page.getByRole('textbox', { name: 'HEX', exact: true }).fill('#12001F')
  await expect(page.locator('html')).toHaveAttribute('data-custom-accent')
  await page.getByRole('button', { name: 'Настройки темы', exact: true }).click()
  await page.getByRole('dialog', { name: 'Настройки внешнего вида' }).getByRole('radio', { name: 'cyan', exact: true }).click()
  await expect(page.getByRole('group', { name: 'Редактор акцента', exact: true })).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-accent')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('energos_theme')!).accent)).toBe('cyan')
})

test('крайние цвета читаемы в обеих темах, черновик исчезает после перезагрузки', async ({ page }) => {
  await page.goto('/profile?tab=appearance')
  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  for (const theme of ['Тёмная', 'Светлая']) {
    await page.getByRole('radiogroup', { name: 'Тема', exact: true }).getByRole('radio', { name: theme, exact: true }).click()
    for (const hex of ['#000000', '#FFFFFF', '#808080', '#00FF00', '#0000FF', '#FF0000', '#12001F']) {
      await page.getByRole('textbox', { name: 'HEX', exact: true }).fill(hex)
      await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--accent-fill'))).toBe(hex)
      await expect.poll(async () => {
        const ratios = await page.locator('.twk-seg-btn.active, .accent-preview-button').evaluateAll(buttons => {
        const luminance = (color: string) => {
          const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(c => c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)
          return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
        }
        return buttons.map(button => {
          const style = getComputedStyle(button)
          const a = luminance(style.color), b = luminance(style.backgroundColor)
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        })
        })
        return Math.min(...ratios)
      }, { message: `${theme}, ${hex}: контраст реальных кнопок` }).toBeGreaterThanOrEqual(4.5)
    }
  }
  await page.reload()
  await expect(page.locator('html')).not.toHaveAttribute('data-custom-accent')
})

test('тёмный акцент не перекрашивает цифры фиксированных метрик', async ({ page }) => {
  await page.goto('/profile?tab=appearance')
  await page.getByRole('button', { name: 'Свой цвет', exact: true }).click()
  await page.getByRole('textbox', { name: 'HEX', exact: true }).fill('#12001F')
  await page.getByRole('button', { name: 'Применить цвет', exact: true }).click()
  await page.goto('/drinks?id=8')
  await page.getByRole('button', { name: /Изменить мой отзыв|Оставить отзыв/, exact: true }).click()
  await page.getByRole('radio', { name: 'Кислотность 3 из 5', exact: true }).check()
  await expect.poll(() => page.locator('[data-rating-field="acidity"] .rate-btn.on').evaluateAll(labels => labels.map(label => getComputedStyle(label).color))).toEqual(['rgb(10, 10, 18)', 'rgb(10, 10, 18)', 'rgb(10, 10, 18)'])
})
