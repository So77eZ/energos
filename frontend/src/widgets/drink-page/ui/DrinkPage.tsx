'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Drink } from '@entities/drink'
import { enrichDrink, enrichDrinks, findSimilarDrinks } from '@entities/drink'
import {
  AdminReviewCard,
  AvgReviewCard,
  calcRating,
  MyReviewCard,
  UserReviewCard,
  type Review,
} from '@entities/review'
import { Avatar, type User } from '@entities/user'
import { BadgeCluster } from '@entities/achievement'
import { EmojiBar } from '@features/emoji-reactions'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { FEATURES } from '@shared/config/features'
import { useToast } from '@shared/lib/toast'
import { VerifyEmailBanner } from '@features/auth/ui/VerifyEmailBanner'
import { deleteReviewAction } from '@features/submit-review/model/actions'
import { ReviewForm } from '@features/submit-review/ui/ReviewForm'
import { DrinkNav } from './DrinkNav'
import { DrinkHero } from './DrinkHero'
import { SimilarRail } from './SimilarRail'

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

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1'

const RATING_FILTER_LABELS: Record<RatingFilter, string> = {
  all: 'Все оценки',
  '5': '5 звёзд',
  '4': '4+ звезды',
  '3': '3+ звезды',
  '2': '2+ звезды',
  '1': '1+ звезда',
}

type ReviewPeriod = 'all' | 'year' | 'month' | 'week'

const PERIOD_LABELS: Record<ReviewPeriod, string> = {
  all: 'За всё время',
  year: 'За год',
  month: 'За месяц',
  week: 'За неделю',
}

const PERIOD_MS: Record<Exclude<ReviewPeriod, 'all'>, number> = {
  year: 365 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
}

function filterReviews(reviews: Review[], rating: RatingFilter, period: ReviewPeriod): Review[] {
  let arr = reviews
  if (rating !== 'all') {
    const min = Number(rating)
    arr = arr.filter((r) => Math.round(calcRating(r)) >= min)
  }
  if (period !== 'all') {
    const cutoff = Date.now() - PERIOD_MS[period]
    arr = arr.filter((r) => {
      const t = Date.parse(r.created_at ?? '')
      return Number.isFinite(t) && t >= cutoff
    })
  }
  return arr
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
      arr.sort((a, b) => calcRating(b) - calcRating(a))
      break
    case 'rating_asc':
      arr.sort((a, b) => calcRating(a) - calcRating(b))
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
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(autoOpenReview)
  const [sort, setSort] = useState<ReviewSort>('date_desc')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [period, setPeriod] = useState<ReviewPeriod>('all')
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

  const enriched = useMemo(() => enrichDrink(activeDrink), [activeDrink])
  const similar = useMemo(() => {
    if (!enriched.metrics) return []
    return findSimilarDrinks(enriched, enrichDrinks(drinks), 4)
  }, [enriched, drinks])

  const adminReview = useMemo(() => initialReviews.find((r) => r.from_admin) ?? null, [initialReviews])
  const userReviews = useMemo(() => initialReviews.filter((r) => !r.from_admin), [initialReviews])
  const otherReviews = useMemo(
    () => userReviews.filter((r) => r.id !== myReview?.id),
    [userReviews, myReview],
  )
  // Сводка по отзывам — с бэка (`drink.stats`), как и в каталоге: цифры не расходятся.
  const avgMetrics = enriched.metrics
  const avgRating = enriched.rating ?? 0
  const visibleOthers = useMemo(
    () => sortedReviews(filterReviews(otherReviews, ratingFilter, period), sort),
    [otherReviews, ratingFilter, period, sort],
  )

  async function handleDelete() {
    if (!myReview) return
    if (!confirm('Удалить ваш отзыв?')) return
    const res = await deleteReviewAction(myReview.id, activeDrink.id)
    if (res?.error) toast({ msg: res.error, kind: 'err' })
  }

  return (
    <div className="page page-drink">
      <DrinkNav drinks={drinks} activeId={activeDrink.id} />

      <DrinkHero
        drink={enriched}
        loggedIn={!!currentUser}
        hasMyReview={!!myReview}
        onWriteReview={() =>
          currentUser && !currentUser.is_verified
            ? toast({ msg: 'Подтвердите e-mail, чтобы оставлять отзывы', kind: 'info' })
            : setFormOpen(true)}
      />

      {(adminReview || avgMetrics) && (
        <section className="reviews-section">
          <div className="rev-grid">
            {adminReview && (
              <AdminReviewCard
                review={adminReview}
                reactions={FEATURES.emojiReactions ? <EmojiBar reviewId={adminReview.id} /> : undefined}
              />
            )}
            {avgMetrics && (
              <AvgReviewCard
                metrics={avgMetrics}
                count={enriched.reviewCount}
                rating={avgRating}
              />
            )}
          </div>
        </section>
      )}

      {currentUser && !currentUser.is_verified && <VerifyEmailBanner email={currentUser.email} />}

      {currentUser && (
        formOpen && currentUser.is_verified ? (
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
              reactions={FEATURES.emojiReactions ? <EmojiBar reviewId={myReview.id} /> : undefined}
            />
          </section>
        ) : null
      )}

      {/* Без автора, комментария и даты (их нет в выдаче API) лента отзывов — набор анонимных
          оценок; пока бэк не отдаёт их, показываем только сводку выше (reviewAuthors). */}
      {FEATURES.reviewAuthors && otherReviews.length > 0 && (
        <section className="other-reviews-section">
          <div className="section-head">
            <h2 className="section-title">
              Отзывы сообщества
              {visibleOthers.length !== otherReviews.length && (
                <span className="section-count"> · {visibleOthers.length} из {otherReviews.length}</span>
              )}
            </h2>
            <div className="section-tools">
              <select
                className="select-min"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
                aria-label="Фильтр по оценке"
              >
                {(Object.keys(RATING_FILTER_LABELS) as RatingFilter[]).map((k) => (
                  <option key={k} value={k}>{RATING_FILTER_LABELS[k]}</option>
                ))}
              </select>
              <select
                className="select-min"
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReviewPeriod)}
                aria-label="Фильтр по периоду"
              >
                {(Object.keys(PERIOD_LABELS) as ReviewPeriod[]).map((k) => (
                  <option key={k} value={k}>{PERIOD_LABELS[k]}</option>
                ))}
              </select>
              <select
                className="select-min"
                value={sort}
                onChange={(e) => setSort(e.target.value as ReviewSort)}
                aria-label="Сортировка"
              >
                {(Object.keys(SORT_LABELS) as ReviewSort[]).map((k) => (
                  <option key={k} value={k}>{SORT_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          {visibleOthers.length > 0 ? (
            <div className="other-rev-grid">
              {visibleOthers.map((r) => (
                <UserReviewCard
                  key={r.id}
                  review={r}
                  avatar={<Avatar username={r.username} seed={r.user_id ?? r.username ?? '?'} size={36} />}
                  badges={FEATURES.achievements ? <BadgeCluster ownedIds={r.authorBadges ?? []} clusterBg="var(--bg-card)" /> : undefined}
                  reactions={FEATURES.emojiReactions ? <EmojiBar reviewId={r.id} /> : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: '32px 20px' }}>
              <Icons.beaker />
              <p>Нет отзывов под выбранный фильтр.</p>
            </div>
          )}
        </section>
      )}

      <SimilarRail matches={similar} />

      {!currentUser && initialReviews.length === 0 && (
        <div className="empty">
          <Icons.beaker />
          <p>Пока никто не оставил отзыв. <button type="button" onClick={() => router.push(ROUTES.auth.login)} style={{ color: 'var(--accent)' }}>Войдите</button>, чтобы быть первым.</p>
        </div>
      )}
    </div>
  )
}
