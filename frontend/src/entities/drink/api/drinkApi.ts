import { httpRequest, rawRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import type { ReviewMetrics } from '@entities/review/@x/drink'
import type { Drink, DrinkCreate, DrinkUpdate, DrinkStats } from '../model/types'
import { toUtcIso } from '../lib/api-date'

const BASE = `${API_V1}/energy-drinks`

// Что отдаёт бэк: EnergyDrinkWithMetricsReadSchema (список) / EnergyDrinkReadSchema (create,
// update, image — без метрик). image_url в API нет — достраиваем в toDrink;
// даты приходят с часовым поясом (`…Z`), но `toUtcIso` страхует от дат без зоны.
interface ApiDrink {
  id: number
  name: string
  price: number | null
  no_sugar: boolean
  created_at?: string | null
  /** Меняется и при загрузке картинки (она в той же строке) — служит её версией. */
  updated_at?: string | null
  avg_rating?: number | null
  reviews_count?: number
  avg_acidity?: number | null
  avg_sweetness?: number | null
  avg_concentration?: number | null
  avg_carbonation?: number | null
  avg_aftertaste?: number | null
  avg_price_quality?: number | null
}

/** Версия картинки — `updated_at` напитка в миллисекундах; null, если бэк его не отдал. */
export function drinkImageVersion(updatedAt: string | null | undefined): number | null {
  const ms = Date.parse(toUtcIso(updatedAt) ?? '')
  return Number.isFinite(ms) ? ms : null
}

/** Картинка отдаётся отдельным эндпоинтом. Есть ли она у напитка, список не говорит.
 *  Браузер берёт её у фронта (`app/drink-image/[id]/route.ts`), а не у /api напрямую:
 *  в проде Caddy проксирует /api только при DEPLOY_ENV=dev, и rewrites в Next нет.
 *  `?v=` — версия: новая картинка → новый адрес, поэтому её можно кешировать надолго. */
export function drinkImageUrl(id: number, updatedAt?: string | null): string {
  const v = drinkImageVersion(updatedAt)
  return v === null ? `/drink-image/${id}` : `/drink-image/${id}?v=${v}`
}

const toStats = (d: ApiDrink): DrinkStats => {
  const count = d.reviews_count ?? 0
  const m = {
    acidity: d.avg_acidity,
    sweetness: d.avg_sweetness,
    carbonation: d.avg_carbonation,
    concentration: d.avg_concentration,
    aftertaste: d.avg_aftertaste,
    price_quality: d.avg_price_quality,
  }
  const complete = count > 0 && Object.values(m).every((v) => typeof v === 'number')
  return {
    rating: count > 0 && typeof d.avg_rating === 'number' ? d.avg_rating : null,
    reviewsCount: count,
    metrics: complete ? (m as ReviewMetrics) : null,
  }
}

const toDrink = (d: ApiDrink): Drink => ({
  id: d.id,
  name: d.name,
  price: d.price ?? null,
  no_sugar: d.no_sugar,
  image_url: drinkImageUrl(d.id, d.updated_at),
  created_at: toUtcIso(d.created_at),
  updated_at: toUtcIso(d.updated_at),
  stats: toStats(d),
})

export const drinkApi = {
  /** Все напитки одним запросом: бэк отдаёт каталог целиком (их сотни), фильтры и страницы — на фронте. */
  list: async (): Promise<Drink[]> =>
    (await httpRequest<ApiDrink[]>(`${BASE}/`, { next: { revalidate: 60, tags: ['drinks', 'reviews'] } })).map(toDrink),

  get: async (id: number): Promise<Drink> =>
    toDrink(await httpRequest<ApiDrink>(`${BASE}/${id}`, { next: { revalidate: 60, tags: ['drinks'] } })),

  /** Сырой ответ бэка с картинкой — для маршрута-прокси `/drink-image/[id]`. */
  image: (id: number): Promise<Response> => rawRequest(`${BASE}/${id}/image`, { cache: 'no-store' }),

  create: async (body: DrinkCreate, token: string): Promise<Drink> =>
    toDrink(await httpRequest<ApiDrink>(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify(body),
    })),

  update: async (id: number, body: DrinkUpdate, token: string): Promise<Drink> =>
    toDrink(await httpRequest<ApiDrink>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify(body),
    })),

  remove: (id: number, token: string) =>
    httpRequest<void>(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    }),

  uploadImage: async (id: number, file: File, token: string): Promise<Drink> => {
    const form = new FormData()
    form.append('image', file)
    return toDrink(await httpRequest<ApiDrink>(`${BASE}/${id}/image`, {
      method: 'POST',
      headers: bearerHeaders(token),
      body: form,
    }))
  },

  removeImage: (id: number, token: string) =>
    httpRequest<void>(`${BASE}/${id}/image`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    }),
}
