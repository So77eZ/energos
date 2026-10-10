import 'server-only'
import { headers } from 'next/headers'

// Только символы адреса: IPv4, IPv6 и IPv4-mapped (::ffff:1.2.3.4). Строгий разбор не нужен —
// важно, чтобы в заголовок к бэку не попали запятые, пробелы и переводы строк.
const IP_CHARS = /^[0-9a-fA-F:.]{2,45}$/

/** Первый адрес из X-Forwarded-For, если он похож на IP. Caddy (а на Vercel — платформа)
 *  перезаписывает заголовок адресом реального клиента, поэтому с клиента его не подделать. */
export function pickClientIp(forwardedFor: string | null | undefined): string | null {
  const first = forwardedFor?.split(',')[0]?.trim()
  return first && IP_CHARS.test(first) ? first : null
}

/** IP клиента текущего запроса к Next. Бэк лимитирует запросы по левому значению
 *  X-Forwarded-For, а без этого заголовка видит один адрес — контейнер фронта, и лимиты на
 *  вход, регистрацию и отзывы становятся общими на весь сайт. `null` — вне запроса
 *  (сборка, фон) или заголовка нет (прямой доступ без прокси): тогда бэк считает по своему IP. */
export async function clientIp(): Promise<string | null> {
  try {
    return pickClientIp((await headers()).get('x-forwarded-for'))
  } catch {
    return null
  }
}
