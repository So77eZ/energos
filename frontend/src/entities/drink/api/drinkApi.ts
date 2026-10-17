import { httpRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import { fetchAllPages } from '@shared/api/paginate'
import type { ReviewMetrics } from '@entities/review/@x/drink'
import type { Drink, DrinkCreate, DrinkUpdate, DrinkStats } from '../model/types'
import { toUtcIso } from '../lib/api-date'

const BASE = `${API_V1}/energy-drinks`

// Что отдаёт бэк: EnergyDrinkWithMetricsReadSchema (список) / EnergyDrinkReadSchema (create,
// update, image — без метрик). image_url и updated_at в API нет — достраиваем в toDrink;
// created_at приходит с часовым поясом (`…Z`), но `toUtcIso` страхует от дат без зоны.
interface ApiDrink {
  id: number
  name: string
  price: number | null
  no_sugar: boolean
  created_at?: string | null
  avg_rating?: number | null
  reviews_count?: number
  avg_acidity?: number | null
  avg_sweetness?: number | null
  avg_concentration?: number | null
  avg_carbonation?: number | null
  avg_aftertaste?: number | null
  avg_price_quality?: number | null
}

/** Картинка отдаётся отдельным эндпоинтом. Есть ли она у напитка, список не говорит —
 *  при отсутствии бэк вернёт 404 (вопрос бэкендеру: docs/mvp-backend-questions.md). */
export const drinkImageUrl = (id: number) => `${BASE}/${id}/image`

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
  image_url: drinkImageUrl(d.id),
  created_at: toUtcIso(d.created_at),
  updated_at: null,
  stats: toStats(d),
})

export const drinkApi = {
  /** Все напитки: число страниц считается по `GET /energy-drinks/count`, страницы грузятся параллельно. */
  list: async (): Promise<Drink[]> =>
    (await fetchAllPages<ApiDrink>(
      `${BASE}/`,
      { next: { revalidate: 60, tags: ['drinks', 'reviews'] } },
      `${BASE}/count`,
    )).map(toDrink),

  // GET /energy-drinks/{id} в API нет — ищем в общем списке (он кэшируется на 60 с).
  get: async (id: number): Promise<Drink> => {
    const found = (await drinkApi.list()).find((d) => d.id === id)
    if (!found) throw new Error('Напиток не найден')
    return found
  },

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
