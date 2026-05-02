'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useMemo } from 'react'

const REVIEWS_PER_PAGE = 6
type ReviewSort = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'
const REVIEW_SORT_LABELS: Record<ReviewSort, string> = {
  date_desc:   'Сначала новые',
  date_asc:    'Сначала старые',
  rating_desc: 'Высокая оценка',
  rating_asc:  'Низкая оценка',
}
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Zap, Star, Pencil, MessageSquarePlus, X, Trash2,
  Biohazard, Candy, Bubbles, FlaskConical, Shell, BadgeRussianRuble,
  type LucideIcon,
} from 'lucide-react'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { METRIC_LABELS, METRIC_KEYS, calcRating } from '@entities/review'
import type { User } from '@entities/user'
import { ReviewForm } from '@features/submit-review/ui/ReviewForm'
import { deleteReviewAction } from '@features/submit-review/model/actions'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'

interface ReviewsPageProps {
  drinks: Drink[]
  activeDrink: Drink | null
  initialReviews: Review[]
  currentUser: User | null
  myReview: Review | null
  autoOpenReview?: boolean
}

const TEXT_COLORS = ['text-neon-cyan', 'text-neon-blue', 'text-neon-pink', 'text-purple-400', 'text-amber-400', 'text-neon-green']
const METRIC_ICONS: LucideIcon[] = [Biohazard, Candy, Bubbles, FlaskConical, Shell, BadgeRussianRuble]

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('ru-RU')
}

function isEdited(review: Review) {
  if (!review.updated_at || !review.created_at) return false
  return Math.abs(new Date(review.updated_at).getTime() - new Date(review.created_at).getTime()) > 2000
}

function MetricBars({ review, label, numeric = false }: { review: Review; label: string; numeric?: boolean }) {
  const rating = calcRating(review)
  return (
    <div className="glass-surface rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[#f0f0f5]">{label}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 fill-neon-pink text-neon-pink" />
          <span className="text-sm font-bold text-neon-pink">
            {numeric ? review.rating.toFixed(1) : review.rating}
          </span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {METRIC_KEYS.map((key, i) => {
          const Icon = METRIC_ICONS[i]
          return (
            <li key={key} className="flex items-center gap-1.5 text-xs">
              <span className="flex-1 min-w-0 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
              {numeric ? (
                <span className={`shrink-0 font-semibold ${TEXT_COLORS[i]}`}>
                  {review[key].toFixed(1)}
                </span>
              ) : (
                <span className="shrink-0 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, dot) => (
                    <Icon key={dot} className={`w-2.5 h-2.5 ${dot < review[key] ? TEXT_COLORS[i] : 'text-white/15'}`} />
                  ))}
                </span>
              )}
            </li>
          )
        })}
      </ul>
      <div className="flex items-center gap-1 text-xs text-[#9090a8] pt-1 border-t border-white/5">
        <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" />
        Средний балл: <span className="text-neon-cyan font-semibold ml-1">{rating}</span>
      </div>
    </div>
  )
}

function MyReviewCard({ review, onEdit, onDelete }: { review: Review; onEdit: () => void; onDelete: () => void }) {
  const edited = isEdited(review)
  const displayDate = edited ? review.updated_at : review.created_at
  const rating = calcRating(review)

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 border border-neon-blue/50 bg-neon-blue/8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neon-cyan">
        {review.from_admin ? 'Ваш администраторский отзыв' : 'Ваш отзыв'}
      </span>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-neon-pink text-neon-pink" />
          <span className="text-sm font-bold text-neon-pink">{review.rating}</span>
        </div>
      </div>

      <ul className="space-y-1.5">
        {METRIC_KEYS.map((key, i) => {
          const Icon = METRIC_ICONS[i]
          return (
            <li key={key} className="flex items-center gap-1.5 text-xs">
              <span className="flex-1 min-w-0 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
              <span className="shrink-0 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, dot) => (
                  <Icon key={dot} className={`w-2.5 h-2.5 ${dot < review[key] ? TEXT_COLORS[i] : 'text-white/15'}`} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>      {review.comment && (
        <p className="text-sm text-[#f0f0f5] mt-2 italic">"{review.comment}"</p>
      )}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[11px] text-[#9090a8]">
          {displayDate && `${edited ? 'Дата редактирования: ' : 'Дата публикации: '}${formatDate(displayDate)}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Изменить
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-[#9090a8] hover:text-red-400 hover:bg-red-400/5 border border-white/10 hover:border-red-400/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Удалить
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-[#9090a8] pt-1 border-t border-white/5">
        <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" />
        Средний балл: <span className="text-neon-cyan font-semibold ml-1">{rating}</span>
      </div>
    </div>
  )
}

function OtherReviewCard({ review }: { review: Review }) {
  const edited = isEdited(review)
  const displayDate = edited ? review.updated_at : review.created_at
  return (
    <div className="glass-surface rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#f0f0f5]">{review.username ?? `Пользователь #${review.user_id}`}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-neon-pink text-neon-pink" />
            <span className="text-sm font-bold text-neon-pink">{review.rating}</span>
          </div>
        </div>
      </div>
      <ul className="space-y-1 text-xs">
        {METRIC_KEYS.map((key, i) => {
          const Icon = METRIC_ICONS[i]
          return (
            <li key={key} className="flex items-center gap-1.5">
              <span className="flex-1 min-w-0 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
              <span className="shrink-0 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, dot) => (
                  <Icon key={dot} className={`w-2.5 h-2.5 ${dot < review[key] ? TEXT_COLORS[i] : 'text-white/15'}`} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>      {review.comment && (
        <p className="text-sm text-[#f0f0f5] mt-2 italic">"{review.comment}"</p>
      )}      {displayDate && (
        <span className="text-[11px] text-[#9090a8]">
          {edited ? 'Дата редактирования: ' : 'Дата публикации: '}
          {formatDate(displayDate)}
        </span>
      )}
      <div className="flex items-center gap-1 text-xs text-[#9090a8] pt-1 border-t border-white/5">
        <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" />
        Средний балл: <span className="text-neon-cyan font-semibold ml-1">{calcRating(review)}</span>
      </div>
    </div>
  )
}

export function ReviewsPage({ drinks, activeDrink, initialReviews, currentUser, myReview, autoOpenReview }: ReviewsPageProps) {
  const router = useRouter()
  const { setSearchItems } = useCatalogSearch()
  const [editing, setEditing] = useState(false)
  const [formOpen, setFormOpen] = useState(autoOpenReview ?? false)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewSort, setReviewSort] = useState<ReviewSort>('date_desc')
  const isMounted = useRef(false)

  useEffect(() => {
    setSearchItems(drinks.map((d) => ({ id: d.id, name: d.name, image_url: d.image_url })))
    return () => setSearchItems([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drinks])

  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return }
    setEditing(false); setFormOpen(false); setReviewPage(1); setReviewSort('date_desc')
  }, [activeDrink?.id])

  function navigate(direction: -1 | 1) {
    if (!activeDrink || drinks.length === 0) return
    const idx = drinks.findIndex((d) => d.id === activeDrink.id)
    const next = drinks[(idx + direction + drinks.length) % drinks.length]
    router.push(ROUTES.reviews(next.id))
  }

  function handleEdit() {
    setEditing(true)
    setFormOpen(true)
  }

  function handleDelete() {
    if (!myReview || !activeDrink) return
    if (!confirm('Удалить ваш отзыв?')) return
    deleteReviewAction(myReview.id, activeDrink.id)
  }

  function handleClose() {
    setFormOpen(false)
    setEditing(false)
  }

  const adminReview = initialReviews.find((r) => r.from_admin) ?? null
  const userReviews = initialReviews.filter((r) => !r.from_admin)
  const otherReviews = myReview ? userReviews.filter((r) => r.id !== myReview.id) : userReviews

  const sortedReviews = useMemo(() => {
    const arr = [...otherReviews]
    if (reviewSort === 'date_desc') arr.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    else if (reviewSort === 'date_asc') arr.sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
    else if (reviewSort === 'rating_desc') arr.sort((a, b) => b.rating - a.rating)
    else arr.sort((a, b) => a.rating - b.rating)
    return arr
  }, [otherReviews, reviewSort])

  const reviewTotalPages = Math.max(1, Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE))
  const safeReviewPage = Math.min(reviewPage, reviewTotalPages)
  const paginatedReviews = useMemo(
    () => sortedReviews.slice((safeReviewPage - 1) * REVIEWS_PER_PAGE, safeReviewPage * REVIEWS_PER_PAGE),
    [sortedReviews, safeReviewPage],
  )

  const avgReview = userReviews.length > 0
    ? {
        ...userReviews[0],
        ...Object.fromEntries(
          METRIC_KEYS.map((k) => [
            k,
            Math.round((userReviews.reduce((s, r) => s + r[k], 0) / userReviews.length) * 10) / 10,
          ]),
        ),
        rating: Math.round((userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length) * 10) / 10,
      } as Review
    : null

  if (!activeDrink) {
    return (
      <p className="text-center text-[#9090a8] py-16">
        В базе нет напитков. Добавьте их в разделе «Управление».
      </p>
    )
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-0">
      {/* 1. Navigation + drink info */}
      <div className="glass rounded-xl p-5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          disabled={drinks.length <= 1}
          className="p-2 rounded-lg text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden">
            {activeDrink.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeDrink.image_url} alt={activeDrink.name} className="w-full h-full object-contain p-1" />
            ) : (
              <Zap className="w-8 h-8 text-neon-cyan/20" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[#f0f0f5] text-lg leading-snug">{activeDrink.name}</h1>
            {activeDrink.price != null && (
              <p className="text-sm text-neon-pink">{activeDrink.price.toFixed(2)} ₽</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate(1)}
          disabled={drinks.length <= 1}
          className="p-2 rounded-lg text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Admin rating */}
      <div className="grid grid-cols-2 gap-[5px] sm:gap-4">
        {adminReview ? (
          <MetricBars review={adminReview} label="Оценка администратора" />
        ) : (
          <div className="glass-surface rounded-xl p-4 text-sm text-[#9090a8]">
            Администратор ещё не оценил этот напиток.
          </div>
        )}

        {/* Average other users (shown here only, beside admin) */}
        {avgReview ? (
          <MetricBars review={avgReview} label={`Средняя оценка пользователей (${userReviews.length})`} numeric />
        ) : userReviews.length === 0 ? (
          <div className="glass-surface rounded-xl p-4 text-sm text-[#9090a8]">
            Пользовательских отзывов пока нет.
          </div>
        ) : null}
      </div>

      {/* 3. My review / кнопка оставить отзыв */}
      {currentUser ? (
        myReview ? (
          <MyReviewCard review={myReview} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="fixed bottom-4 left-4 right-4 sm:static sm:w-full flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm font-semibold text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 transition-colors z-30 sm:z-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Оставить отзыв
          </button>
        )
      ) : (
        <div className="glass rounded-xl p-5 text-center text-sm text-[#9090a8]">
          <a href="/auth/login" className="text-neon-cyan hover:underline">Войдите</a>, чтобы оставить отзыв.
        </div>
      )}

      {/* 4. Other user reviews */}
      {otherReviews.length > 0 && (
        <div className="flex flex-col gap-4">
          {otherReviews.length > 1 && (
            <div className="flex items-center justify-end">
              <select
                value={reviewSort}
                onChange={(e) => { setReviewSort(e.target.value as ReviewSort); setReviewPage(1) }}
                className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
              >
                {(Object.keys(REVIEW_SORT_LABELS) as ReviewSort[]).map((k) => (
                  <option key={k} value={k}>{REVIEW_SORT_LABELS[k]}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-[5px] sm:gap-4">
            {paginatedReviews.map((r) => (
              <OtherReviewCard key={r.id} review={r} />
            ))}
          </div>

          {reviewTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                disabled={safeReviewPage === 1}
                className="p-2 rounded-lg text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm text-[#9090a8]">
                <span className="text-neon-cyan font-semibold">{safeReviewPage}</span>
                {' / '}
                {reviewTotalPages}
              </span>

              <button
                onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                disabled={safeReviewPage === reviewTotalPages}
                className="p-2 rounded-lg text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: форма отзыва */}
      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-xs max-h-[90vh] overflow-y-auto pointer-events-auto relative">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[#9090a8] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <ReviewForm
                  drinkId={activeDrink.id}
                  editReview={editing ? myReview : null}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
