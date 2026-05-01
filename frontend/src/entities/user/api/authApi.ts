import { httpRequest, bearerHeaders } from '@shared/api/http'
import type { User, AuthToken } from '../model/types'

export const authApi = {
  login: (username: string, password: string) => {
    const form = new URLSearchParams()
    form.set('username', username)
    form.set('password', password)
    return httpRequest<AuthToken>('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  },

  register: (username: string, password: string) =>
    httpRequest<User>('/api/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),

  me: (token: string) =>
    httpRequest<User>('/api/auth/me/', {
      headers: bearerHeaders(token),
    }),
}
