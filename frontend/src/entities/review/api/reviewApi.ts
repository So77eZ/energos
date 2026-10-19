import { httpRequest, bearerHeaders, API_V1 } from '@shared/api/http'
import { fetchAllPages } from '@shared/api/paginate'
import type { Review, ReviewCreate, ReviewMetrics, ReviewUpdate } from '../model/types'

const BASE = `${API_V1}/reviews`

// Что отдаёт бэк: ReviewReadSchema = оценки (целые 1–5) + rating + comment + id + автор.
// Привязки к напитку (`energy_drink_id`) в ответе нет — напиток известен из запроса.
interface ApiReview extends ReviewMetrics {
  id: number
  rating: number
  comment: string | null
  created_at?: string
  updated_at?: string
  user: { id: number; username: string; role: string }
}

// `GET /reviews/me` (ReviewForUserSchema): вместо автора — напиток, к которому относится отзыв.
interface ApiMyReview extends ReviewMetrics {
  id: number
  rating: number
  comment: string | null
  created_at?: string
  updated_at?: string
  energy_drink: { id: number }
}

const fromApi = (r: ApiReview, drinkId: number): Review => ({
  id: r.id,
  energy_drink_id: drinkId,
  acidity: r.acidity,
  sweetness: r.sweetness,
  carbonation: r.carbonation,
  concentration: r.concentration,
  aftertaste: r.aftertaste,
  price_quality: r.price_quality,
  rating: r.rating,
  user_id: r.user.id,
  username: r.user.username,
  comment: r.comment,
  // Отзыв админа показываем отдельно (карточка «редакции» вверху страницы напитка).
  from_admin: r.user.role === 'admin',
  created_at: r.created_at ?? null, // бэк отдаёт ISO с часовым поясом (`…Z`)
  updated_at: r.updated_at ?? null,
})

const fromMyApi = (r: ApiMyReview): Review => ({
  id: r.id,
  energy_drink_id: r.energy_drink.id,
  acidity: r.acidity,
  sweetness: r.sweetness,
  carbonation: r.carbonation,
  concentration: r.concentration,
  aftertaste: r.aftertaste,
  price_quality: r.price_quality,
  rating: r.rating,
  user_id: null, // это отзывы текущего пользователя, автор не нужен
  username: null,
  comment: r.comment,
  from_admin: false,
  created_at: r.created_at ?? null,
  updated_at: r.updated_at ?? null,
})

/** Оценки в теле запроса — целые 1–5. `rating` выбирает пользователь отдельно от метрик. */
const scores = (m: ReviewMetrics & { rating: number }) => ({
  acidity: m.acidity,
  sweetness: m.sweetness,
  carbonation: m.carbonation,
  concentration: m.concentration,
  aftertaste: m.aftertaste,
  price_quality: m.price_quality,
  rating: Math.min(5, Math.max(1, Math.round(m.rating))),
})

export const reviewApi = {
  /** Все отзывы напитка (бэк пагинирует — собираем страницы). Рейтинг и число отзывов
   *  считает бэк (`drink.stats`), эта выдача нужна для списка отзывов и «моего отзыва». */
  byDrink: async (drinkId: number): Promise<Review[]> =>
    (await fetchAllPages<ApiReview>(`${BASE}/?energy_drink_id=${drinkId}`, { cache: 'no-store' }))
      .map((r) => fromApi(r, drinkId)),

  create: async (drinkId: number, body: ReviewCreate, token: string): Promise<Review> => {
    const comment = body.comment?.trim()
    const created = await httpRequest<ApiReview>(`${BASE}/${drinkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify({ ...scores(body), ...(comment ? { comment } : {}) }),
    })
    return fromApi(created, drinkId)
  },

  update: async (id: number, drinkId: number, body: ReviewUpdate, token: string): Promise<Review> => {
    const updated = await httpRequest<ApiReview>(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...bearerHeaders(token) },
      body: JSON.stringify({ ...scores(body), comment: body.comment }),
    })
    return fromApi(updated, drinkId)
  },

  remove: (id: number, token: string) =>
    httpRequest<void>(`${BASE}/${id}`, {
      method: 'DELETE',
      headers: bearerHeaders(token),
    }),

  /** «Мои отзывы»: `GET /reviews/me` (только подтверждённый пользователь, иначе 403). */
  myReviews: async (token: string): Promise<Review[]> =>
    (await fetchAllPages<ApiMyReview>(`${BASE}/me`, { headers: bearerHeaders(token), cache: 'no-store' }))
      .map(fromMyApi),
}
