import { cookies } from 'next/headers'

const COOKIE_NAME = 'auth_token'

export async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  })
}

export async function clearToken(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
