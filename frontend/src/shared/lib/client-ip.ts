import 'server-only'
import { headers } from 'next/headers'

/** Заголовки с реальным IP клиента для запросов server actions к бэку (#106).
 *  Бэк видит IP сервера Next, общий для всех, и без этого лимиты на вход,
 *  регистрацию и отзывы становятся общими на весь сайт.
 *
 *  IP берём из первого X-Forwarded-For: Vercel и Caddy перезаписывают его сами,
 *  подделать с клиента нельзя. Бэк верит X-Client-IP только вместе с секретом.
 *  Без секрета или без заголовка — пустой объект, бэк считает по своему IP. */
export async function clientIpHeaders(): Promise<Record<string, string>> {
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) return {}
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!ip) return {}
  return { 'X-Client-IP': ip, 'X-Internal-Secret': secret }
}
