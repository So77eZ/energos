import { httpRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import { fetchAllPages } from '@shared/api/paginate'
import { calcRating, type Review, type ReviewCreate, type ReviewMetrics, type ReviewUpdate } from '../model/types'

const BASE = `${API_V1}/reviews`

// Что отдаёт бэк (docs/api.md): ReviewSchema = оценки + overall + id (после create/update);
// внутри GET /energy-drinks/ отзывы приходят без id и без привязки к автору.
interface ApiReviewScores extends ReviewMetrics {
  overall: number
}
interface ApiReview extends ApiReviewScores {
  id: number
}
interface ApiDrinkWithReviews {
  id: number
  reviews: ApiReviewScores[]
}

const fromApi = (r: ApiReviewScores & { id?: number }, drinkId: number, id: number): Review => ({
  id,
  energy_drink_id: drinkId,
  acidity: r.acidity,
  sweetness: r.sweetness,
  carbonation: r.carbonation,
  concentration: r.concentration,
  aftertaste: r.aftertaste,
  price_quality: r.price_quality,
  // Автора, комментария, дат и признака «админский» в выдаче нет (флаги reviewAuthors/adminReviews).
  user_id: null,
  username: null,
  comment: null,
  from_admin: false,
  created_at: null,
  updated_at: null,
})

const scores = (m: ReviewMetrics): ApiReviewScores => ({
  acidity: m.acidity,
  sweetness: m.sweetness,
  carbonation: m.carbonation,
  concentration: m.concentration,
  aftertaste: m.aftertaste,
  price_quality: m.price_quality,
  overall: calcRating(m),
})

// Те же URL и опции, что у drinkApi.list (включая счётчик) — Next отдаёт один запрос на оба вызова за рендер.
const loadAll = () =>
  fetchAllPages<ApiDrinkWithReviews>(
    `${API_V1}/energy-drinks/`,
    { next: { revalidate: 60, tags: ['drinks', 'reviews'] } },
    `${API_V1}/energy-drinks/count`,
  )

/** У отзывов из списка напитков нет id. Для React-ключей и расчётов даём уникальный
 *  отрицательный — мутировать по нему нельзя (правка/удаление работают по id из ответа POST). */
const syntheticId = (drinkId: number, index: number) => -(drinkId * 10_000 + index + 1)

export const reviewApi = {
  /** Все отзывы (оценки) — собираются из GET /energy-drinks/, где они вложены в напиток. */
  list: async (): Promise<Review[]> => {
    const drinks = await loadAll()
    return drinks.flatMap((d) => d.reviews.map((r, i) => fromApi(r, d.id, syntheticId(d.id, i))))
  },

  byDrink: async (drinkId: number): Promise<Review[]> => {
    const drink = (await loadAll()).find((d) => d.id === drinkId)
    return drink ? drink.reviews.map((r, i) => fromApi(r, drink.id, syntheticId(drink.id, i))) : []
  },

  create: async (drinkId: number, body: ReviewCreate, token: string, extraHeaders?: Record<string, string>): Promise<Review> => {
    const comment = body.comment?.trim()
    const created = await httpRequest<ApiReview>(`${BASE}/${drinkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token), ...extraHeaders },
      body: JSON.stringify({ ...scores(body), ...(comment ? { comment } : {}) }),
    })
    return fromApi(created, drinkId, created.id)
  },

  update: async (id: number, drinkId: number, body: ReviewUpdate, token: string): Promise<Review> => {
    const updated = await httpRequest<ApiReview>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify({ ...scores(body), comment: body.comment }),
    })
    return fromApi(updated, drinkId, updated.id)
  },

  remove: (id: number, token: string) =>
    httpRequest<void>(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    }),

  /** «Мои отзывы»: эндпоинта нет, а в выдаче нет user_id — см. флаг reviewAuthors. */
  myReviews: async (_token: string): Promise<Review[]> => [],
}
