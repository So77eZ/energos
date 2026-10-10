// Server Components (Node.js) need an absolute URL — relative paths don't resolve.
// Browser requests use relative path so Next.js rewrites proxy them to the backend.
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_ORIGIN ?? 'http://localhost')
    : ''

/** Префикс версионированного API бэка (docs/api.md): снаружи `/api/v1`. */
export const API_V1 = '/api/v1'

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

export async function parseError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (json.detail) {
      if (Array.isArray(json.detail)) {
        return json.detail
          .map((d: { msg?: string; ctx?: { error?: unknown } }) => {
            // FastAPI кладёт ValueError из валидаторов в ctx.error как `{}` —
            // строкой берём только настоящую строку, иначе текст из msg.
            const raw = (typeof d.ctx?.error === 'string' ? d.ctx.error : d.msg) ?? JSON.stringify(d)
            return raw.replace(/^Value error,\s*/i, '')
          })
          .join('; ')
      }
      // fastapi-users кладёт ошибки пароля объектом {code, reason}; String() дал бы «[object Object]».
      if (typeof json.detail === 'object') {
        const d = json.detail as { reason?: unknown; code?: unknown }
        if (typeof d.reason === 'string') return d.reason
        if (typeof d.code === 'string') return d.code
        return JSON.stringify(json.detail)
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

/** Запрос к бэку без разбора ответа — для бинарных данных (картинки). */
export function rawRequest(path: string, options?: HttpOptions): Promise<Response> {
  const headers = {
    ...options?.headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000' } : {}),
  }
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // httpOnly cookies for auth
  })
}

export async function httpRequest<T>(path: string, options?: HttpOptions): Promise<T> {
  const res = await rawRequest(path, options)
  assertResponseOk(res) // 401 → SessionExpiredError, 429 → RateLimitError (ДО generic)
  if (!res.ok) throw new Error(await parseError(res))
  // 204 No Content (DELETE, logout) — тела нет, res.json() бросил бы.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
