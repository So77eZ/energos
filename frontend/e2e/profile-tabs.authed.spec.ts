import { test, expect } from '@playwright/test'

test('быстрые настройки переключают уже открытый профиль на оформление', async ({ context, page }) => {
  await context.addInitScript(() => {
    localStorage.setItem('energos_age_verified', 'true')
    localStorage.setItem('energos_analytics_consent', 'denied')
  })
  await page.goto('/profile')
  const reviews = page.getByRole('tab', { name: 'Отзывы', exact: true })
  const appearance = page.getByRole('tab', { name: 'Оформление', exact: true })
  await expect(reviews).toHaveAttribute('aria-selected', 'true')

  await page.getByRole('button', { name: 'Настройки темы', exact: true }).click()
  await page.getByRole('link', { name: 'Все настройки оформления' }).click()
  await expect(page).toHaveURL('/profile?tab=appearance')
  await expect(appearance).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('radiogroup', { name: 'Анимации', exact: true })).toBeVisible()

  await reviews.click()
  await expect(page).toHaveURL('/profile')
  await expect(reviews).toHaveAttribute('aria-selected', 'true')
  await appearance.click()
  await expect(page).toHaveURL('/profile?tab=appearance')
  await expect(appearance).toHaveAttribute('aria-selected', 'true')
})
