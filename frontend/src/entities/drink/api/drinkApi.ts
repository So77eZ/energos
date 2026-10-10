import { httpRequest, rawRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import { fetchAllPages } from '@shared/api/paginate'
import type { Drink, DrinkCreate, DrinkUpdate } from '../model/types'

const BASE = `${API_V1}/energy-drinks`

// Что отдаёт бэк (docs/api.md): EnergyDrinkSchema / EnergyDrinkWithReviewsSchema.
// image_url, created_at, updated_at в API нет — достраиваем в toDrink.
interface ApiDrink {
  id: number
  name: string
  price: number | null
  no_sugar: boolean
}

/** Картинка отдаётся отдельным эндпоинтом. Есть ли она у напитка, список не говорит.
 *  Браузер берёт её у фронта (`app/drink-image/[id]/route.ts`), а не у /api напрямую:
 *  в проде Caddy проксирует /api только при DEPLOY_ENV=dev, и rewrites в Next нет. */
export const drinkImageUrl = (id: number) => `/drink-image/${id}`

const toDrink = (d: ApiDrink): Drink => ({
  id: d.id,
  name: d.name,
  price: d.price ?? null,
  no_sugar: d.no_sugar,
  image_url: drinkImageUrl(d.id),
  created_at: null,
  updated_at: null,
})

export const drinkApi = {
  /** Все напитки (бэк пагинирует — собираем страницы). */
  list: async (): Promise<Drink[]> =>
    (await fetchAllPages<ApiDrink>(`${BASE}/`, { next: { revalidate: 60, tags: ['drinks', 'reviews'] } })).map(toDrink),

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
