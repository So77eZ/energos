import { afterEach, describe, expect, it, vi } from 'vitest'
import { authApi } from './authApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const apiUser = { id: 3, email: 'neon@example.com', is_active: true, is_superuser: false, is_verified: false }

afterEach(() => vi.unstubAllGlobals())

describe('authApi', () => {
  it('me: username — локальная часть e-mail, роль user по умолчанию', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(apiUser)))

    expect(await authApi.me('tok')).toMatchObject({
      id: 3, email: 'neon@example.com', username: 'neon', role: 'user', is_verified: false,
    })
  })

  it('me: is_superuser → admin; явная role из API приоритетнее', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ...apiUser, is_superuser: true })))
    expect((await authApi.me('tok')).role).toBe('admin')

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ ...apiUser, is_superuser: true, role: 'user' })))
    expect((await authApi.me('tok')).role).toBe('user')
  })

  it('login: form-urlencoded, поле username несёт e-mail', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ access_token: 'a', token_type: 'bearer' }))
    vi.stubGlobal('fetch', fetchMock)

    await authApi.login('neon@example.com', 'secret123')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/auth/login')
    expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
    expect(new URLSearchParams(init.body).get('username')).toBe('neon@example.com')
  })

  it('register: JSON { email, password }', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(apiUser, 201))
    vi.stubGlobal('fetch', fetchMock)

    await authApi.register('neon@example.com', 'secret123')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'neon@example.com', password: 'secret123' })
  })

  it('forgotPassword: POST /auth/forgot-password { email }, 202 без тела не падает', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('null', { status: 202 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(authApi.forgotPassword('neon@example.com')).resolves.toBeNull()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/auth/forgot-password')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ email: 'neon@example.com' })
  })

  it('resetPassword: POST /auth/reset-password { token, password }', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(null))
    vi.stubGlobal('fetch', fetchMock)

    await authApi.resetPassword('tok123', 'NewPassw0rd!')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/auth/reset-password')
    expect(JSON.parse(init.body)).toEqual({ token: 'tok123', password: 'NewPassw0rd!' })
  })
})
