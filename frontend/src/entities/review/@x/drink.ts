// Публичное cross-import API review ДЛЯ entities/drink (FSD `@x`).
// Drink вычисляет рейтинг/метрики/тир из отзывов и показывает их мини-виджетом —
// импортит ровно эти символы через @x, а не весь @entities/review.
export { calcRating, METRIC_KEYS } from '../model/types'
export type { Review, ReviewMetrics } from '../model/types'
export { MiniMetrics } from '../ui/MiniMetrics'
