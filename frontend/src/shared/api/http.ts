import { clientIp } from '#client-ip'

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

/** Прочая ошибка бэка: `message` — текст бэка как есть (на английском), `status` — HTTP-код,
 *  `code` — машинный код из `{"error": {"code": …}}` (`REVIEW_ALREADY_EXISTS` и т. п.).
 *  Локализовать надо по `code`, а не по тексту. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly code: string | null = null) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Единая точка маппинга статусов ответа в типизированные ошибки.
 *  Любой authed-запрос (с телом и без) обязан пройти через неё. */
export function assertResponseOk(res: Response): void {
  if (res.status === 401) throw new SessionExpiredError() // ДО RateLimit и generic
  if (res.status === 429) throw new RateLimitError()
}

/** Текст из значения ошибки: строка, список ошибок валидации Pydantic или объект fastapi-users. */
function errorText(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((d: { msg?: string; ctx?: { error?: unknown } }) => {
        // FastAPI кладёт ValueError из валидаторов в ctx.error как `{}` —
        // строкой берём только настоящую строку, иначе текст из msg.
        const raw = (typeof d.ctx?.error === 'string' ? d.ctx.error : d.msg) ?? JSON.stringify(d)
        return raw.replace(/^Value error,\s*/i, '')
      })
      .join('; ')
  }
  // fastapi-users кладёт ошибки пароля объектом {code, reason}; String() дал бы «[object Object]».
  if (value && typeof value === 'object') {
    const d = value as { reason?: unknown; code?: unknown }
    if (typeof d.reason === 'string') return d.reason
    if (typeof d.code === 'string') return d.code
    return JSON.stringify(value)
  }
  return String(value)
}

/** Ошибка из тела ответа. Бэк отдаёт `{"error": {"code", "message", "fields"?}}`; старый формат
 *  `{"detail": …}` тоже понимаем (fastapi-users и прокси могут вернуть его). */
export async function parseApiError(res: Response): Promise<{ code: string | null; message: string }> {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    const err = json?.error
    if (err && typeof err === 'object') {
      const code = typeof err.code === 'string' ? err.code : null
      // Ошибка валидации: подробности в fields, message там общий («Request validation failed»).
      const message = Array.isArray(err.fields) && err.fields.length ? errorText(err.fields) : errorText(err.message ?? '')
      return { code, message: message || code || res.statusText }
    }
    if (json?.detail) return { code: null, message: errorText(json.detail) }
  } catch {
    // not JSON — use raw text
  }
  return { code: null, message: text || res.statusText }
}

export async function parseError(res: Response): Promise<string> {
  return (await parseApiError(res)).message
}

export const bearerHeaders = (token: string) => ({ Authorization: `Bearer ${token}` })

type HttpOptions = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }

/** Реальный IP клиента для бэка (лимиты по IP). Только на сервере Next и только для запросов
 *  не из Data Cache: заголовки входят в ключ кеша, и с IP в нём каждый клиент получил бы свою
 *  копию публичного списка вместо общей на 60 с. Эти запросы бэк и так видит редко (раз в
 *  минуту на маршрут), так что им общий адрес фронта не мешает. */
async function clientIpHeader(options?: HttpOptions): Promise<Record<string, string>> {
  if (typeof window !== 'undefined') return {}
  if (options?.next?.revalidate !== undefined || options?.cache === 'force-cache') return {}
  try {
    const ip = await clientIp()
    return ip ? { 'X-Forwarded-For': ip } : {}
  } catch {
    return {}
  }
}

/** Запрос к бэку без разбора ответа — для бинарных данных (картинки). */
export async function rawRequest(path: string, options?: HttpOptions): Promise<Response> {
  const headers = {
    ...options?.headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.PUBLIC_URL ?? 'http://localhost:3000' } : {}),
    ...(await clientIpHeader(options)),
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
  if (!res.ok) {
    const { code, message } = await parseApiError(res)
    throw new ApiError(res.status, message, code)
  }
  // 204 No Content (DELETE, logout) — тела нет, res.json() бросил бы.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
