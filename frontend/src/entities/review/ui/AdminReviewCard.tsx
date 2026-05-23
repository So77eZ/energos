// Expert/admin review card — purple-bordered with rev-badge.
// Mirrors frontendNew/page-drink.jsx → AdminReviewCard.

import { Icons } from '@shared/ui/icons'
import { calcRating, METRIC_KEYS, type Review } from '../model/types'
import { MetricDotRow } from './MetricDotRow'

interface AdminReviewCardProps {
  review: Review
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function AdminReviewCard({ review }: AdminReviewCardProps) {
  return (
    <article className="rev-card rev-admin">
      <header className="rev-head">
        <div className="rev-head-l">
          <span className="rev-badge">
            <Icons.flask w={10} /> ОЦЕНКА АДМИНИСТРАТОРА
          </span>
          {review.username && <span className="rev-meta-author">{review.username}</span>}
        </div>
        <div className="rev-rating">
          <Icons.star w={16} /> <span>{calcRating(review).toFixed(1)}</span>
        </div>
      </header>
      <div className="rev-body">
        <div className="rev-metrics">
          {METRIC_KEYS.map((k) => (
            <MetricDotRow key={k} metricKey={k} value={review[k]} />
          ))}
        </div>
        {review.comment && <p className="rev-comment">«{review.comment}»</p>}
      </div>
      <footer className="rev-foot">
        <span className="rev-date">{formatDate(review.updated_at ?? review.created_at)}</span>
        <span className="rev-dim">Базовая оценка эксперта</span>
      </footer>
    </article>
  )
}
