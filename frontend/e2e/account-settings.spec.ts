import { expect, test, type APIRequestContext, type BrowserContext } from '@playwright/test'

const apiRoot = process.env.E2E_API_ROOT ?? 'http://localhost'
const mailpit = process.env.E2E_MAILPIT_URL
const originalPassword = ' OldAccount123! '
const replacementPassword = ' NewAccount456! '

// These tests create their own disposable LOCAL accounts; never use the shared e2e user.
test.skip(!mailpit, 'Set E2E_MAILPIT_URL to run local account-change integration tests')
test.beforeEach(async ({ context, baseURL }) => {
  for (const origin of [baseURL, apiRoot, mailpit]) {
    if (!origin || !['localhost', '127.0.0.1', '[::1]'].includes(new URL(origin).hostname)) {
      throw new Error('Account-change tests may only run against loopback services')
    }
  }
  await context.addInitScript(() => {
    localStorage.setItem('energos_age_verified', 'true')
    localStorage.setItem('energos_analytics_consent', 'denied')
    localStorage.setItem('energos_gfx', 'low')
    localStorage.setItem('energos_motion_notice', 'dismissed')
    if (!localStorage.getItem('energos_theme')) {
      localStorage.setItem('energos_theme', JSON.stringify({ theme: 'dark', accent: 'cyan', motion: 'off' }))
    }
  })
})

async function verificationToken(request: APIRequestContext, email: string) {
  let token = ''
  await expect.poll(async () => {
    const result = await request.get(`${mailpit}/api/v1/search`, { params: { query: `to:${email}` } })
    expect(result.ok()).toBe(true)
    const { messages } = await result.json()
    if (!messages?.length) return false
    const message = await request.get(`${mailpit}/api/v1/message/${messages[0].ID}`)
    const body = await message.json()
    token = (body.HTML || body.Text || '').match(/[?&]token=([^"'\s<>]+)/)?.[1] ?? ''
    return !!token
  }, { timeout: 20000 }).toBe(true)
  return token
}

async function createAccount(request: APIRequestContext, context: BrowserContext, baseURL: string, verified: boolean) {
  const name = `acct${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
  const email = `${name}@example.com`
  const registration = await request.post(`${apiRoot}/api/v1/auth/register`, {
    data: { username: name, email, password: originalPassword },
  })
  expect(registration.status()).toBe(201)
  if (verified) {
    const response = await request.post(`${apiRoot}/api/v1/auth/verify`, {
      data: { token: await verificationToken(request, email) },
    })
    expect(response.status()).toBe(200)
  }
  const login = await request.post(`${apiRoot}/api/v1/auth/login`, { form: { username: email, password: originalPassword } })
  expect(login.status()).toBe(200)
  const { access_token: token } = await login.json()
  await context.addCookies([{ name: 'auth_token', value: token, url: baseURL, httpOnly: true, secure: baseURL.startsWith('https://'), sameSite: 'Lax' }])
  return { email, newEmail: `${name}.new@example.com`, token }
}

test('email confirmation, reauthentication and password change work end to end', async ({ page, request, context, baseURL }, testInfo) => {
  const account = await createAccount(request, context, baseURL!, true)
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/profile?tab=account', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('tab', { name: 'Аккаунт', exact: true })).toHaveAttribute('aria-selected', 'true')
  const emailForm = page.getByRole('form', { name: 'Почта', exact: true })
  const passwordForm = page.getByRole('form', { name: 'Пароль', exact: true })
  await expect(page.getByRole('button', { name: 'Отправить письмо ещё раз', exact: true })).toHaveCount(0)
  await page.locator('.prof-account:visible').screenshot({ path: testInfo.outputPath('account-desktop-dark.png') })

  await emailForm.getByLabel('Новый e-mail', { exact: true }).fill(account.newEmail)
  await emailForm.getByLabel('Текущий пароль', { exact: true }).fill('WrongAccount123!')
  await emailForm.getByRole('button', { name: 'Изменить почту', exact: true }).click()
  await expect(emailForm.getByRole('alert')).toHaveText('Текущий пароль указан неверно')
  await expect(emailForm.getByLabel('Новый e-mail', { exact: true })).toHaveValue(account.newEmail)
  await expect(emailForm.getByLabel('Текущий пароль', { exact: true })).toHaveValue('')

  await emailForm.getByLabel('Текущий пароль', { exact: true }).fill(originalPassword)
  await emailForm.getByRole('button', { name: 'Изменить почту', exact: true }).click()
  await expect(emailForm.getByRole('status')).toContainText(account.newEmail)
  await expect(page.locator('.prof-meta:visible')).toHaveText(account.newEmail)
  await expect(page.getByRole('button', { name: 'Отправить письмо ещё раз', exact: true })).toBeEnabled()
  const me = await request.get(`${apiRoot}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${account.token}` } })
  expect(await me.json()).toMatchObject({ email: account.newEmail, is_verified: false })
  const emailToken = await verificationToken(request, account.newEmail)

  await passwordForm.getByLabel('Текущий пароль', { exact: true }).fill(originalPassword)
  await passwordForm.getByLabel('Новый пароль', { exact: true }).fill(replacementPassword)
  await passwordForm.getByLabel('Повторите новый пароль', { exact: true }).fill('Different123!')
  await passwordForm.getByRole('button', { name: 'Изменить пароль', exact: true }).click()
  await expect(passwordForm.getByRole('alert')).toHaveText('Пароли не совпадают')
  await passwordForm.getByLabel('Текущий пароль', { exact: true }).fill(originalPassword)
  await passwordForm.getByLabel('Новый пароль', { exact: true }).fill(replacementPassword)
  await passwordForm.getByLabel('Повторите новый пароль', { exact: true }).fill(replacementPassword)
  await passwordForm.getByRole('button', { name: 'Изменить пароль', exact: true }).click()
  await expect(passwordForm.getByRole('status')).toHaveText('Пароль изменён.')
  await expect(passwordForm.getByLabel('Новый пароль', { exact: true })).toHaveValue('')
  const oldLogin = await request.post(`${apiRoot}/api/v1/auth/login`, { form: { username: account.newEmail, password: originalPassword } })
  expect(oldLogin.status()).toBe(401)
  const newLogin = await request.post(`${apiRoot}/api/v1/auth/login`, { form: { username: account.newEmail, password: replacementPassword } })
  expect(newLogin.status()).toBe(200)

  await page.goto(`/auth/verify?token=${encodeURIComponent(emailToken)}`)
  await expect(page.getByRole('status')).toContainText('E-mail подтверждён')
  await page.goto('/profile?tab=account')
  await page.setViewportSize({ width: 320, height: 900 })
  await page.evaluate(() => localStorage.setItem('energos_theme', JSON.stringify({ theme: 'light', accent: 'cyan', motion: 'off' })))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('form', { name: 'Почта', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.prof-account:visible').evaluate(element => {
    const headerHeight = document.querySelector('.hdr')?.getBoundingClientRect().height ?? 0
    window.scrollBy(0, element.getBoundingClientRect().top - headerHeight - 16)
  })
  await page.screenshot({ path: testInfo.outputPath('account-mobile-light.png') })
  const savePassword = passwordForm.getByRole('button', { name: 'Изменить пароль', exact: true })
  await savePassword.click()
  await expect(passwordForm.getByLabel('Текущий пароль', { exact: true })).toBeFocused()
  await savePassword.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('account-mobile-password.png') })
  expect(errors).toEqual([])
})

test('a new email resets the resend-confirmation button', async ({ page, request, context, baseURL }) => {
  const account = await createAccount(request, context, baseURL!, false)
  await page.goto('/profile?tab=account')
  await page.getByRole('button', { name: 'Отправить письмо ещё раз', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Письмо отправлено', exact: true })).toBeDisabled()
  const emailForm = page.getByRole('form', { name: 'Почта', exact: true })
  await emailForm.getByLabel('Новый e-mail', { exact: true }).fill(account.newEmail)
  await emailForm.getByLabel('Текущий пароль', { exact: true }).fill(originalPassword)
  await emailForm.getByRole('button', { name: 'Изменить почту', exact: true }).click()
  await expect(emailForm.getByRole('status')).toContainText(account.newEmail)
  await expect(page.getByRole('button', { name: 'Отправить письмо ещё раз', exact: true })).toBeEnabled()
  await verificationToken(request, account.newEmail)
})

test('login preserves a return link to account settings', async ({ page }) => {
  await page.goto('/profile?tab=account')
  await expect(page).toHaveURL(/\/auth\/login\?return=%2Fprofile%3Ftab%3Daccount/)
})
