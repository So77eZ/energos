// Logged-in user's own review with edit/delete actions.
// Mirrors frontendNew/page-drink.jsx → "my review" branch.

import type { ReactNode } from 'react'
import { Icons } from '@shared/ui/icons'
import { calcRating, type Review } from '../model/types'
import { MiniMetrics } from './MiniMetrics'

interface MyReviewCardProps {
  review: Review
  onEdit: () => void
  onDelete: () => void
  /** emoji-реакции инжектит рендерер-виджет (features/emoji-reactions). */
  reactions?: ReactNode
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function MyReviewCard({ review, onEdit, onDelete, reactions }: MyReviewCardProps) {
  const date = formatDate(review.updated_at ?? review.created_at)

  return (
    <article className="rev-card rev-mine">
      <header className="rev-head">
        <div className="rev-head-l">
          <span className="rev-badge rev-badge-mine">
            <Icons.user w={10} /> ВАШ ОТЗЫВ
          </span>
          <span className="rev-date">{date}</span>
        </div>
        <div className="rev-rating">
          <Icons.star w={16} /> <span>{calcRating(review).toFixed(1)}</span>
        </div>
      </header>
      <MiniMetrics metrics={review} />
      {review.comment && <p className="rev-comment">«{review.comment}»</p>}
      {reactions}
      <div className="rev-actions">
        <button type="button" className="cta-ghost" onClick={onEdit}>
          <Icons.edit /> Изменить
        </button>
        <button type="button" className="cta-ghost cta-danger" onClick={onDelete}>
          <Icons.trash /> Удалить
        </button>
      </div>
    </article>
  )
}
