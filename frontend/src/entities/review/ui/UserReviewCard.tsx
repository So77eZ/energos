// Compact user review card — avatar, name, date, rating, mini-metrics, comment.
// Mirrors frontendNew/page-drink.jsx → UserReviewCard.

import type { ReactNode } from 'react'
import { Icons } from '@shared/ui/icons'
import { calcRating, type Review } from '../model/types'
import { MiniMetrics } from './MiniMetrics'

interface UserReviewCardProps {
  review: Review
  /** Слоты: рендерер-виджет инжектит бейджи (entities/achievement) и emoji-реакции
   *  (features/emoji-reactions) — карточка-entity не импортит вверх. */
  badges?: ReactNode
  reactions?: ReactNode
}

const AVATAR_COLORS = ['var(--c-cyan)', 'var(--c-pink)', 'var(--c-green)', 'var(--c-amber)', 'var(--c-purple)']

function pickAvatarColor(seed: string | null | number): string {
  const s = String(seed ?? '?')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function UserReviewCard({ review, badges, reactions }: UserReviewCardProps) {
  const letter = (review.username ?? '?').charAt(0).toUpperCase()
  const color = pickAvatarColor(review.user_id ?? review.username)
  const date = formatDate(review.updated_at ?? review.created_at)

  return (
    <article className="rev-card rev-user">
      <header className="rev-head">
        <div className="rev-head-l">
          <span className="rev-avatar" style={{ background: color }}>{letter}</span>
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
