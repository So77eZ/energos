// Averaged-user-reviews card — horizontal bars per metric, total rating.
// Mirrors frontendNew/page-drink.jsx → AvgReviewCard.

import { Icons } from '@shared/ui/icons'
import { METRIC_COLOR_VARS, METRIC_KEYS, METRIC_LABELS, type ReviewMetrics } from '../model/types'
import { MetricShapes } from './MetricShapes'

interface AvgReviewCardProps {
  metrics: ReviewMetrics
  count: number
  rating: number
}

function pluralizeReviews(n: number): string {
  const last = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} отзывов`
  if (last === 1) return `${n} отзыв`
  if (last >= 2 && last <= 4) return `${n} отзыва`
  return `${n} отзывов`
}

export function AvgReviewCard({ metrics, count, rating }: AvgReviewCardProps) {
  return (
    <article className="rev-card rev-avg">
      <header className="rev-head">
        <div className="rev-head-l">
          <span className="rev-badge rev-badge-avg">
            <Icons.pulse w={10} /> СРЕДНЯЯ ОЦЕНКА ПОЛЬЗОВАТЕЛЕЙ
          </span>
          <span className="rev-meta-author">{pluralizeReviews(count)}</span>
        </div>
        <div className="rev-rating">
          <Icons.star w={16} /> <span>{rating.toFixed(1)}</span>
        </div>
      </header>
      <div className="rev-body">
        <div className="rev-metrics">
          {METRIC_KEYS.map((k) => {
            const Icon = MetricShapes[k]
            const color = METRIC_COLOR_VARS[k]
            return (
              <div key={k} className="dot-row dot-row-numeric">
                <div className="dot-row-label">
                  <span className="dot-row-icon" style={{ color }}>
                    {Icon && <Icon />}
                  </span>
                  <span className="dot-row-name">{METRIC_LABELS[k]}</span>
                </div>
                <div className="dot-row-bar">
                  <div className="dot-row-bar-track">
                    <div
                      className="dot-row-bar-fill"
                      style={{ width: `${(metrics[k] / 5) * 100}%`, background: color }}
                    />
                  </div>
                  <span className="dot-row-val" style={{ color }}>{metrics[k].toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}
