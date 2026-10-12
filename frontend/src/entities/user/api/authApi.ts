import { httpRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import type { User, AuthToken, UserRole } from '../model/types'

const BASE = `${API_V1}/auth`

// UserRead из docs/api.md: id, email, is_active, is_superuser, is_verified.
// `username` и `role` в схеме нет — достраиваем ниже (вопрос бэкендеру: docs/mvp-backend-questions.md).
interface ApiUser {
  id: number
  email: string
  is_active: boolean
  is_superuser: boolean
  is_verified: boolean
  role?: UserRole // если бэк добавит role в UserRead — берём его
}

const toUser = (u: ApiUser): User => ({
  id: u.id,
  email: u.email,
  username: u.email.split('@')[0],
  is_verified: u.is_verified,
  role: u.role ?? (u.is_superuser ? 'admin' : 'user'),
})

export const authApi = {
  // OAuth2PasswordRequestForm: поле называется `username`, но в нём e-mail.
  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    return httpRequest<AuthToken>(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  },

  register: async (email: string, password: string): Promise<User> =>
    toUser(await httpRequest<ApiUser>(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })),

  me: async (token: string): Promise<User> =>
    toUser(await httpRequest<ApiUser>(`${BASE}/me`, {
      headers: bearerHeaders(token),
    })),

  logout: (token: string) =>
    httpRequest<void>(`${BASE}/logout`, {
      method: 'POST',
      headers: bearerHeaders(token),
    }),

  /** Всегда 202 — бэк не раскрывает, есть ли такой e-mail. */
  forgotPassword: (email: string) =>
    httpRequest<void>(`${BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    httpRequest<void>(`${BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }),

  requestVerifyToken: (email: string) =>
    httpRequest<void>(`${BASE}/request-verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }),

  verify: async (token: string): Promise<User> =>
    toUser(await httpRequest<ApiUser>(`${BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })),
}
