export interface ReviewMetrics {
  acidity: number       // 1–5
  sweetness: number     // 1–5
  carbonation: number   // 1–5
  concentration: number // 1–5
  aftertaste: number    // 1–5
  price_quality: number // 1–5
}

export interface Review extends ReviewMetrics {
  id: number
  energy_drink_id: number
  user_id: number | null
  username: string | null
  rating: number        // 1–5, общая оценка
  from_admin: boolean
  created_at: string | null
  updated_at: string | null
}

// from_admin включён — нужен при создании admin-отзыва
export type ReviewCreate = Omit<Review, 'id' | 'user_id' | 'username' | 'created_at' | 'updated_at'>

export const METRIC_LABELS: Record<keyof ReviewMetrics, string> = {
  acidity: 'Кислотность',
  sweetness: 'Сладость',
  carbonation: 'Газированность',
  concentration: 'Концентрация',
  aftertaste: 'Послевкусие',
  price_quality: 'Цена/качество',
}

export const METRIC_KEYS = Object.keys(METRIC_LABELS) as Array<keyof ReviewMetrics>

export function calcRating(metrics: ReviewMetrics): number {
  const sum = METRIC_KEYS.reduce((acc, k) => acc + metrics[k], 0)
  return Math.round((sum / METRIC_KEYS.length) * 10) / 10
}
