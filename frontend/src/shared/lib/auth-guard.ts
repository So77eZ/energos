import 'server-only'
import { headers } from 'next/headers'
import { redirect, unstable_rethrow } from 'next/navigation'
import { SessionExpiredError } from '@shared/api/http'
import { clearToken } from '@shared/lib/session'
import { returnPathFromReferer } from '@shared/lib/safe-return'

/** Если ошибка — протухшая сессия: чистим куку и кидаем на логин с баннером
 *  и return-to (откуда выгнало, из Referer). redirect() бросает NEXT_REDIRECT —
 *  пролетает наружу. Иначе — возврат, дальше обычная обработка ошибки. */
export async function redirectIfSessionExpired(e: unknown): Promise<void> {
  if (!(e instanceof SessionExpiredError)) return
  await clearToken()
  const h = await headers()
  const ownOrigin = process.env.NEXT_PUBLIC_ORIGIN ?? `https://${h.get('host')}`
  const ret = returnPathFromReferer(h.get('referer'), ownOrigin)
  const q = new URLSearchParams({ expired: '1', return: ret })
  redirect(`/auth/login?${q}`)
}

/** Оборачивает server action: session-expiry → clear+redirect; success-redirect
 *  (drink-form/submit-review) и прочие ошибки прокидываются как раньше. */
export function withSessionGuard<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return async (...args: A) => {
    try {
      return await action(...args)
    } catch (e) {
      unstable_rethrow(e)               // прокидывает NEXT_REDIRECT/NEXT_NOT_FOUND (success-path)
      await redirectIfSessionExpired(e) // session → свой NEXT_REDIRECT
      throw e                           // остальное — в обычную обработку экшена
    }
  }
}
