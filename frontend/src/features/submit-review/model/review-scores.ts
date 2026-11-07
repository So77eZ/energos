import { METRIC_LABELS, type ReviewMetrics } from '@entities/review'

export const REVIEW_SCORE_LABELS = { rating: 'Общая оценка', ...METRIC_LABELS }

export function getInvalidReviewScoreKeys(scores: ReviewMetrics & { rating: number }) {
  return (Object.keys(REVIEW_SCORE_LABELS) as Array<keyof typeof REVIEW_SCORE_LABELS>)
    .filter((key) => !Number.isInteger(scores[key]) || scores[key] < 1 || scores[key] > 5)
}
