import { drinkApi, drinkImageVersion } from '@entities/drink'

/** Картинка напитка для <img>. Публичная, токен не нужен.
 *
 *  Зачем прокси: браузер ходит только к фронту — в проде `/api/*` наружу не проксируется
 *  (Caddy при DEPLOY_ENV != dev, rewrites из next.config убраны).
 *  Заодно отдаём Cache-Control: бэк кеш-заголовков не ставит.
 *
 *  `?v=` — версия картинки (updated_at напитка, см. drinkImageUrl). Совпала с текущей —
 *  кешируем на год: новая картинка придёт по новому адресу. Нет или не совпала (страница
 *  со старыми данными, подобранный руками `v`) — 5 минут, как без версии: иначе любой `v`
 *  навсегда оседал бы в кеше оптимизатора. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^\d+$/.test(id)) return new Response(null, { status: 404 })

  const v = new URL(req.url).searchParams.get('v')
  const [res, drink] = await Promise.all([
    drinkApi.image(Number(id)).catch(() => null),
    v ? drinkApi.get(Number(id)).catch(() => null) : Promise.resolve(null),
  ])
  const type = res?.headers.get('content-type') ?? ''
  // Напиток без картинки бэк отдаёт как 200 с пустым телом — для <img> это 404.
  const empty = res?.headers.get('content-length') === '0'
  if (!res || !res.ok || empty || !type.startsWith('image/')) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=30' } })
  }
  const current = drink ? drinkImageVersion(drink.updated_at) : null
  const versioned = v !== null && current !== null && v === String(current)
  return new Response(res.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
