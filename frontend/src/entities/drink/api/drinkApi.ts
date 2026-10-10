import { httpRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import { fetchAllPages } from '@shared/api/paginate'
import type { Drink, DrinkCreate, DrinkUpdate } from '../model/types'
import { toUtcIso } from '../lib/api-date'

const BASE = `${API_V1}/energy-drinks`

// Что отдаёт бэк (docs/api.md): EnergyDrinkSchema / EnergyDrinkWithReviewsSchema.
// image_url и updated_at в API нет — достраиваем в toDrink; created_at приходит без часового пояса.
interface ApiDrink {
  id: number
  name: string
  price: number | null
  no_sugar: boolean
  created_at?: string | null
}

/** Картинка отдаётся отдельным эндпоинтом. Есть ли она у напитка, список не говорит —
 *  при отсутствии бэк вернёт 404 (вопрос бэкендеру: docs/mvp-backend-questions.md). */
export const drinkImageUrl = (id: number) => `${BASE}/${id}/image`

const toDrink = (d: ApiDrink): Drink => ({
  id: d.id,
  name: d.name,
  price: d.price ?? null,
  no_sugar: d.no_sugar,
  image_url: drinkImageUrl(d.id),
  created_at: toUtcIso(d.created_at),
  updated_at: null,
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
