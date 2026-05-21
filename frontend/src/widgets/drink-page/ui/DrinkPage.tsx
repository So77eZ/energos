'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Drink } from '@entities/drink'
import { enrichDrink } from '@entities/drink'
import {
  AdminReviewCard,
  AvgReviewCard,
  MyReviewCard,
  METRIC_KEYS,
  UserReviewCard,
  type Review,
  type ReviewMetrics,
} from '@entities/review'
import type { User } from '@entities/user'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { deleteReviewAction } from '@features/submit-review/model/actions'
import { ReviewForm } from '@features/submit-review/ui/ReviewForm'
import { DrinkNav } from './DrinkNav'
import { DrinkHero } from './DrinkHero'

interface DrinkPageProps {
  drinks: Drink[]
  activeDrink: Drink
  initialReviews: Review[]
  currentUser: User | null
  myReview: Review | null
  autoOpenReview?: boolean
}

type ReviewSort = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'

const SORT_LABELS: Record<ReviewSort, string> = {
  date_desc: 'Сначала новые',
  date_asc: 'Сначала старые',
  rating_desc: 'Высокая оценка',
  rating_asc: 'Низкая оценка',
}

function averageMetrics(reviews: Review[]): ReviewMetrics | null {
  if (reviews.length === 0) return null
  const sum = METRIC_KEYS.reduce<Record<string, number>>((acc, k) => ({ ...acc, [k]: 0 }), {})
  for (const r of reviews) {
    for (const k of METRIC_KEYS) sum[k] += r[k]
  }
  return Object.fromEntries(METRIC_KEYS.map((k) => [k, sum[k] / reviews.length])) as unknown as ReviewMetrics
}

function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
}

function sortedReviews(reviews: Review[], sort: ReviewSort): Review[] {
  const arr = [...reviews]
  switch (sort) {
    case 'date_desc':
      arr.sort((a, b) => (Date.parse(b.created_at ?? '') || 0) - (Date.parse(a.created_at ?? '') || 0))
      break
    case 'date_asc':
      arr.sort((a, b) => (Date.parse(a.created_at ?? '') || 0) - (Date.parse(b.created_at ?? '') || 0))
      break
    case 'rating_desc':
      arr.sort((a, b) => b.rating - a.rating)
      break
    case 'rating_asc':
      arr.sort((a, b) => a.rating - b.rating)
      break
  }
  return arr
}

export function DrinkPage({
  drinks,
  activeDrink,
  initialReviews,
  currentUser,
  myReview,
  autoOpenReview = false,
}: DrinkPageProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(autoOpenReview)
  const [sort, setSort] = useState<ReviewSort>('date_desc')
  const formRef = useRef<HTMLDivElement>(null)

  // Reset form-open when drink changes.
  useEffect(() => {
    setFormOpen(autoOpenReview)
  }, [activeDrink.id, autoOpenReview])

  // Scroll the form into view when it opens — keeps focus near the can-rating
  // controls instead of leaving them below the fold after the hero CTA fires.
  useEffect(() => {
    if (!formOpen) return
    const el = formRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [formOpen])

  const enriched = useMemo(() => enrichDrink(activeDrink, initialReviews), [activeDrink, initialReviews])

  const adminReview = useMemo(() => initialReviews.find((r) => r.from_admin) ?? null, [initialReviews])
  const userReviews = useMemo(() => initialReviews.filter((r) => !r.from_admin), [initialReviews])
  const otherReviews = useMemo(
    () => userReviews.filter((r) => r.id !== myReview?.id),
    [userReviews, myReview],
  )
  const avgMetrics = useMemo(() => averageMetrics(userReviews), [userReviews])
  const avgRating = useMemo(() => averageRating(userReviews), [userReviews])
  const sortedOthers = useMemo(() => sortedReviews(otherReviews, sort), [otherReviews, sort])

  async function handleDelete() {
    if (!myReview) return
    if (!confirm('Удалить ваш отзыв?')) return
    await deleteReviewAction(myReview.id, activeDrink.id)
  }

  return (
    <div className="page page-drink">
      <DrinkNav drinks={drinks} activeId={activeDrink.id} />

      <DrinkHero
        drink={enriched}
        loggedIn={!!currentUser}
        hasMyReview={!!myReview}
        onWriteReview={() => setFormOpen(true)}
      />

      {(adminReview || avgMetrics) && (
        <section className="reviews-section">
          <div className="rev-grid">
            {adminReview && <AdminReviewCard review={adminReview} />}
            {avgMetrics && (
              <AvgReviewCard
                metrics={avgMetrics}
                count={userReviews.length}
                rating={avgRating}
              />
            )}
          </div>
        </section>
      )}

      {currentUser && (
        formOpen ? (
          <div ref={formRef}>
            <ReviewForm
              drinkId={activeDrink.id}
              drinkName={activeDrink.name}
              editReview={myReview}
              onClose={() => setFormOpen(false)}
            />
          </div>
        ) : myReview ? (
          <section className="my-review-section">
            <MyReviewCard
              review={myReview}
              onEdit={() => setFormOpen(true)}
              onDelete={handleDelete}
            />
          </section>
        ) : null
      )}

      {sortedOthers.length > 0 && (
        <section className="other-reviews-section">
          <div className="section-head">
            <h2 className="section-title">Отзывы сообщества</h2>
            <div className="section-tools">
              <select
                className="select-min"
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
              >
                {(Object.keys(SORT_LABELS) as ReviewSort[]).map((k) => (
                  <option key={k} value={k}>{SORT_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="other-rev-grid">
            {sortedOthers.map((r) => (
              <UserReviewCard key={r.id} review={r} />
            ))}
          </div>
        </section>
      )}

      {!currentUser && initialReviews.length === 0 && (
        <div className="empty">
          <Icons.beaker />
          <p>Пока никто не оставил отзыв. <button type="button" onClick={() => router.push(ROUTES.auth.login)} style={{ color: 'var(--accent)' }}>Войдите</button>, чтобы быть первым.</p>
        </div>
      )}
    </div>
  )
}
