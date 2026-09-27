import { submissionApi } from '@entities/submission'
import { getToken } from '@shared/lib/session'

/** Картинка заявки для <img>: браузер не может передать токен сам, он в httpOnly-cookie.
 *  Бэк отдаёт картинку только автору заявки и админу (#95). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response(null, { status: 404 })

  const token = await getToken()
  if (!token) return new Response(null, { status: 401 })

  const res = await submissionApi.image(Number(id), token)
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) {
    return new Response(null, { status: res.status === 401 ? 401 : 404 })
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
