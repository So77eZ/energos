// Compact user review card — avatar, name, date, rating, mini-metrics, comment.
// Mirrors frontendNew/page-drink.jsx → UserReviewCard.

import type { ReactNode } from 'react'
import { Icons } from '@shared/ui/icons'
import { calcRating, type Review } from '../model/types'
import { MiniMetrics } from './MiniMetrics'

interface UserReviewCardProps {
  review: Review
  /** Слоты: рендерер-виджет инжектит аватар (entities/user), бейджи (entities/achievement)
   *  и emoji-реакции (features/emoji-reactions) — карточка-entity не импортит вверх/кросс-слайс. */
  avatar?: ReactNode
  badges?: ReactNode
  reactions?: ReactNode
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function UserReviewCard({ review, avatar, badges, reactions }: UserReviewCardProps) {
  const date = formatDate(review.updated_at ?? review.created_at)

  return (
    <article className="rev-card rev-user">
      <header className="rev-head">
        <div className="rev-head-l">
          {avatar}
          <div>
            <div className="rev-name-row">
              <span className="rev-username">{review.username ?? 'аноним'}</span>
              {badges}
            </div>
            <div className="rev-date">{date}</div>
          </div>
        </div>
        <div className="rev-rating">
          <Icons.star w={16} /> <span>{calcRating(review).toFixed(1)}</span>
        </div>
      </header>
      <MiniMetrics metrics={review} />
      {review.comment && <p className="rev-comment">«{review.comment}»</p>}
      {reactions}
    </article>
  )
}
