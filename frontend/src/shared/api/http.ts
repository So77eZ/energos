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

export async function httpRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = {
    ...options?.headers,
    ...(typeof window === 'undefined' ? { 'Origin': process.env.NEXT_PUBLIC_ORIGIN ?? 'http://localhost:3000' } : {}),
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // httpOnly cookies for auth
  })
  if (res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<T>
}
