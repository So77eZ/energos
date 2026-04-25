// Server Components (Node.js) need an absolute URL — relative paths don't resolve.
// Browser requests use relative path so Next.js rewrites proxy them to the backend.
const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_ORIGIN ?? 'http://localhost')
    : ''

async function parseError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (json.detail) {
      if (Array.isArray(json.detail)) {
        return json.detail
          .map((d: { msg?: string }) => d.msg ?? JSON.stringify(d))
          .join('; ')
      }
      return String(json.detail)
    }
  } catch {
    // not JSON — use raw text
  }
  return text || res.statusText
}

export async function httpRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // httpOnly cookies for auth
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<T>
}
