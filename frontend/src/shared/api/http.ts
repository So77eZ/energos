// Server Components (Node.js) need an absolute URL — relative paths don't resolve.
// Browser requests use relative path so Next.js rewrites proxy them to the backend.
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_ORIGIN ?? 'http://localhost')
    : ''

export class RateLimitError extends Error {
  constructor() {
    super('Слишком много запросов. Пожалуйста, подождите немного.')
    this.name = 'RateLimitError'
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Сессия истекла, войдите снова.')
    this.name = 'SessionExpiredError'
  }
}

/** Единая точка маппинга статусов ответа в типизированные ошибки.
 *  Любой authed-запрос (с телом и без) обязан пройти через неё. */
export function assertResponseOk(res: Response): void {
  if (res.status === 401) throw new SessionExpiredError() // ДО RateLimit и generic
  if (res.status === 429) throw new RateLimitError()
}

async function parseError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (json.detail) {
      if (Array.isArray(json.detail)) {
        return json.detail
          .map((d: { msg?: string; ctx?: { error?: unknown } }) => {
            const raw = (d.ctx?.error != null ? String(d.ctx.error) : d.msg) ?? JSON.stringify(d)
            return raw.replace(/^Value error,\s*/i, '')
          })
          .join('; ')
      }
      return String(json.detail)
    }
  } catch {
    // not JSON — use raw text
  }
  return text || res.statusText
}

export const bearerHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

type HttpOptions = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }

export async function httpRequest<T>(path: string, options?: HttpOptions): Promise<T> {
  const headers = {
    ...options?.headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000' } : {}),
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // httpOnly cookies for auth
  })
  assertResponseOk(res) // 401 → SessionExpiredError, 429 → RateLimitError (ДО generic)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<T>
}
