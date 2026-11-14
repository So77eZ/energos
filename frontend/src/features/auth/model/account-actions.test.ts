import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, RateLimitError, SessionExpiredError } from '@shared/api/http'
import { changeEmailAction, changePasswordAction } from './account-actions'

const m = vi.hoisted(() => ({
  me: vi.fn(), login: vi.fn(), updateMe: vi.fn(), getToken: vi.fn(),
  revalidatePath: vi.fn(), redirect: vi.fn(), sessionExpired: vi.fn(),
}))
vi.mock('@entities/user', () => ({ authApi: { me: m.me, login: m.login, updateMe: m.updateMe } }))
vi.mock('@shared/lib/session', () => ({ getToken: m.getToken }))
vi.mock('@shared/lib/auth-guard', () => ({ redirectIfSessionExpired: m.sessionExpired }))
vi.mock('next/cache', () => ({ revalidatePath: m.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: m.redirect }))

const user = { id: 7, email: 'owner@example.com', username: 'Owner', role: 'user', is_verified: true }
const currentPassword = ' CurrentPass123 '
const password = ' NewPass456 '
const form = (values: Record<string, string>) => {
  const data = new FormData()
  Object.entries(values).forEach(([key, value]) => data.set(key, value))
  return data
}
const emailForm = () => form({ email: 'new@example.com', currentPassword })
const passwordForm = () => form({ currentPassword, password, confirm: password })

beforeEach(() => {
  vi.resetAllMocks()
  m.getToken.mockResolvedValue('session-token')
  m.me.mockResolvedValue(user)
  m.login.mockResolvedValue({ access_token: 'reauth-token', token_type: 'bearer' })
  m.updateMe.mockResolvedValue({ ...user, email: 'new@example.com', is_verified: false })
  m.redirect.mockImplementation((url: string) => { throw new Error(`redirect:${url}`) })
  m.sessionExpired.mockImplementation(async (error: unknown) => {
    if (error instanceof SessionExpiredError) throw error
  })
})

describe('changeEmailAction', () => {
  it('reauthenticates the session owner and only sends the new email', async () => {
    const data = form({ email: '  new@example.com  ', currentPassword, accountEmail: 'attacker@example.com', id: '99' })
    await expect(changeEmailAction(null, data)).resolves.toEqual({ error: '', success: true, email: 'new@example.com' })
    expect(m.me).toHaveBeenCalledWith('session-token')
    expect(m.login).toHaveBeenCalledWith(user.email, currentPassword)
    expect(m.updateMe).toHaveBeenCalledWith('session-token', { email: 'new@example.com' })
    expect(m.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it.each(['', 'invalid', 'name@domain', 'with space@example.com'])('rejects malformed email %j before API calls', async email => {
    expect((await changeEmailAction(null, form({ email, currentPassword })))?.error).toBe('Введите корректный e-mail')
    expect(m.login).not.toHaveBeenCalled()
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('rejects the current email, including case-only changes', async () => {
    expect((await changeEmailAction(null, form({ email: 'OWNER@example.com', currentPassword })))?.error).toBe('Укажите другой e-mail')
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('preserves the entered email when the backend reports it is taken', async () => {
    m.updateMe.mockRejectedValue(new ApiError(409, 'Email already exists', 'EMAIL_ALREADY_EXISTS'))
    await expect(changeEmailAction(null, emailForm())).resolves.toEqual({
      error: 'Пользователь с таким e-mail уже зарегистрирован', email: 'new@example.com',
    })
    expect(m.revalidatePath).not.toHaveBeenCalled()
  })

  it('localizes backend email validation', async () => {
    m.updateMe.mockRejectedValue(new ApiError(422, 'value is not a valid email address'))
    expect((await changeEmailAction(null, emailForm()))?.error).toBe('Введите корректный e-mail')
  })
})

describe('changePasswordAction', () => {
  it('preserves spaces and only sends the new password after reauthentication', async () => {
    await expect(changePasswordAction(null, passwordForm())).resolves.toEqual({ error: '', success: true })
    expect(m.login).toHaveBeenCalledWith(user.email, currentPassword)
    expect(m.updateMe).toHaveBeenCalledWith('session-token', { password })
  })

  it('rejects a mismatched confirmation before reauthentication', async () => {
    expect((await changePasswordAction(null, form({ currentPassword, password, confirm: 'Different123' })))?.error).toBe('Пароли не совпадают')
    expect(m.login).not.toHaveBeenCalled()
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it.each(['', 'short', '1234567', '😀😀😀😀'])('rejects a password shorter than 8 Unicode characters: %j', async password => {
    expect((await changePasswordAction(null, form({ currentPassword, password, confirm: password })))?.error).toBe('Пароль должен быть не короче 8 символов')
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('accepts eight Unicode characters, matching the backend length rule', async () => {
    const password = '😀'.repeat(8)
    await expect(changePasswordAction(null, form({ currentPassword, password, confirm: password }))).resolves.toEqual({ error: '', success: true })
    expect(m.updateMe).toHaveBeenCalledWith('session-token', { password })
  })
})

describe.each([
  ['email', changeEmailAction, emailForm],
  ['password', changePasswordAction, passwordForm],
] as const)('%s account change boundaries', (_name, action, makeForm) => {
  it('rejects a missing current password and file values', async () => {
    for (const value of ['', new File(['data'], 'password.txt')]) {
      const data = makeForm()
      data.set('currentPassword', value)
      expect((await action(null, data))?.error).toBe('Введите текущий пароль')
    }
    expect(m.login).not.toHaveBeenCalled()
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it.each([new ApiError(400, 'LOGIN_BAD_CREDENTIALS', 'HTTP_400'), new SessionExpiredError()])('keeps the session when login rejects the current password: %s', async error => {
    m.login.mockRejectedValue(error)
    const result = await action(null, makeForm())
    expect(result?.error).toBe('Текущий пароль указан неверно')
    expect(m.updateMe).not.toHaveBeenCalled()
    expect(m.revalidatePath).not.toHaveBeenCalled()
    expect(m.redirect).not.toHaveBeenCalled()
    expect(m.sessionExpired).not.toHaveBeenCalled()
    expect(JSON.stringify(result)).not.toContain(currentPassword)
    expect(JSON.stringify(result)).not.toContain(password)
    expect(JSON.stringify(result)).not.toContain('reauth-token')
  })

  it('preserves login rate-limit errors', async () => {
    const error = new RateLimitError()
    m.login.mockRejectedValue(error)
    expect((await action(null, makeForm()))?.error).toBe(error.message)
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('rejects reauthentication if the returned token belongs to a different account', async () => {
    m.me.mockResolvedValueOnce(user).mockResolvedValueOnce({ ...user, id: 99 })
    expect((await action(null, makeForm()))?.error).toBe('Текущий пароль указан неверно')
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('redirects a missing session to login', async () => {
    m.getToken.mockResolvedValue(null)
    await expect(action(null, makeForm())).rejects.toThrow('redirect:/auth/login')
    expect(m.me).not.toHaveBeenCalled()
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('passes an expired session through the existing session handler', async () => {
    const error = new SessionExpiredError()
    m.updateMe.mockRejectedValue(error)
    await expect(action(null, makeForm())).rejects.toBe(error)
    expect(m.sessionExpired).toHaveBeenCalledWith(error)
  })

  it('does not treat an expired original session as an incorrect password', async () => {
    const error = new SessionExpiredError()
    m.me.mockRejectedValue(error)
    await expect(action(null, makeForm())).rejects.toBe(error)
    expect(m.sessionExpired).toHaveBeenCalledWith(error)
    expect(m.updateMe).not.toHaveBeenCalled()
  })
})
