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
    // В проде всегда Secure (cookie только по HTTPS). Раньше зависело от
    // NEXT_PUBLIC_ORIGIN — опечатка/незаданный env снимали защиту (MITM по plain HTTP).
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Совпадает с JWT exp на бэке (ACCESS_TOKEN_EXPIRE_MINUTES=30): cookie умирает
    // вместе с токеном — без «зомби»-сессии (7д cookie держала мёртвый токен → API 401
    // при «залогинен»). Расширится когда бэк добавит refresh (см. docs/backend-contract.md).
    maxAge: 60 * 30, // 30 минут = JWT exp
  })
}

export async function clearToken(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
