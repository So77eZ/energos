import { drinkApi } from '@entities/drink'

/** Картинка напитка для <img>. Публичная, токен не нужен.
 *
 *  Зачем прокси: браузер ходит только к фронту — в проде `/api/*` наружу не проксируется
 *  (Caddy при DEPLOY_ENV != dev, rewrites из next.config убраны).
 *  Заодно отдаём Cache-Control: бэк кеш-заголовков не ставит, и картинка (до 1 МБ)
 *  скачивалась бы заново на каждый просмотр страницы. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response(null, { status: 404 })

  const res = await drinkApi.image(Number(id)).catch(() => null)
  const type = res?.headers.get('content-type') ?? ''
  // Напиток без картинки бэк отдаёт как 200 с пустым телом — для <img> это 404.
  const empty = res?.headers.get('content-length') === '0'
  if (!res || !res.ok || empty || !type.startsWith('image/')) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=30' } })
  }
  return new Response(res.body, {
    headers: {
      'Content-Type': type,
      // Недолго: админ может заменить картинку, а ETag бэк не отдаёт.
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
