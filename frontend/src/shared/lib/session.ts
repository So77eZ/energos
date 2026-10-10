import { cookies } from 'next/headers'
import { secondsUntilExpiry } from './token-expiry'

const COOKIE_NAME = 'auth_token'
const FALLBACK_MAX_AGE = 60 * 30

export async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    // В проде всегда Secure (cookie только по HTTPS). Раньше зависело от
    // NEXT_PUBLIC_ORIGIN — опечатка/незаданный env снимали защиту (MITM по plain HTTP).
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Срок cookie берём из `exp` самого токена (TOKEN_LIFETIME_SECONDS на бэке, сейчас 24 ч):
    // cookie умирает вместе с токеном — без «зомби»-сессии (долгая cookie держала бы мёртвый токен →
    // API 401 при «залогинен») и без преждевременного выхода (раньше было зашито 30 минут).
    maxAge: cookieMaxAge(token),
  })
}

/** Срок жизни cookie в секундах: остаток токена; если токен не разобрать — запасные 30 минут. */
function cookieMaxAge(token: string): number {
  const left = secondsUntilExpiry(token)
  return left === null ? FALLBACK_MAX_AGE : Math.max(left, 0)
}

export async function clearToken(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
