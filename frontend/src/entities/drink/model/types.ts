import type { ReviewMetrics } from '@entities/review/@x/drink'

/** Сводка по отзывам напитка. Считает бэк (`avg_*`, `reviews_count` в `GET /energy-drinks/`). */
export interface DrinkStats {
  /** Средний общий рейтинг (`avg_rating`); `null`, пока нет отзывов. */
  rating: number | null
  reviewsCount: number
  /** Средние по шести метрикам; `null`, пока нет отзывов. */
  metrics: ReviewMetrics | null
}

export interface Drink {
  id: number
  name: string
  price: number | null
  image_url: string | null
  no_sugar: boolean
  created_at: string | null
  updated_at: string | null
  stats: DrinkStats
}

// Картинка меняется только через uploadImage, в теле POST/PUT её нет (#104, #114).
export type DrinkCreate = Pick<Drink, 'name' | 'price' | 'no_sugar'>
export type DrinkUpdate = DrinkCreate
