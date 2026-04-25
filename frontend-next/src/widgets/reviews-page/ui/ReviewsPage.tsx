'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Zap, Star, Pencil, MessageSquarePlus, X } from 'lucide-react'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { METRIC_LABELS, METRIC_KEYS, calcRating } from '@entities/review'
import type { User } from '@entities/user'
import { ReviewForm } from '@features/submit-review/ui/ReviewForm'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'

interface ReviewsPageProps {
  drinks: Drink[]
  activeDrink: Drink | null
  initialReviews: Review[]
  currentUser: User | null
  myReview: Review | null
}

const DOT_COLORS = ['bg-neon-cyan','bg-neon-blue','bg-neon-pink','bg-purple-400','bg-amber-400','bg-neon-green']

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('ru-RU')
}

function isEdited(review: Review) {
  if (!review.updated_at || !review.created_at) return false
  return Math.abs(new Date(review.updated_at).getTime() - new Date(review.created_at).getTime()) > 2000
}

function MetricBars({ review, label }: { review: Review; label: string }) {
  const rating = calcRating(review)
  return (
    <div className="glass-surface rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#f0f0f5]">{label}</h4>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-neon-cyan text-neon-cyan" />
          <span className="text-sm font-bold text-neon-cyan">{rating}</span>
        </div>
      </div>
      <ul className="space-y-1.5">
        {METRIC_KEYS.map((key, i) => (
          <li key={key} className="flex items-center gap-2 text-xs">
            <span className="w-28 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, dot) => (
                <span key={dot} className={`w-2 h-2 rounded-full ${dot < review[key] ? DOT_COLORS[i] : 'bg-white/10'}`} />
              ))}
            </span>
            <span className="ml-auto text-[#9090a8]">{review[key]}/5</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MyReviewCard({ review, onEdit }: { review: Review; onEdit: () => void }) {
  const edited = isEdited(review)
  const displayDate = edited ? review.updated_at : review.created_at
  const rating = calcRating(review)

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 border border-neon-blue/50 bg-neon-blue/8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neon-cyan">Ваш отзыв</span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-neon-pink text-neon-pink" />
            <span className="text-sm font-bold text-neon-pink">{review.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {displayDate && (
            <span className="text-[11px] text-[#9090a8]">
              {edited ? 'Дата редактирования: ' : 'Дата публикации: '}
              {formatDate(displayDate)}
            </span>
          )}
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 border border-white/10 hover:border-neon-cyan/30 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Изменить
          </button>
        </div>
      </div>

      <ul className="space-y-1.5">
        {METRIC_KEYS.map((key, i) => (
          <li key={key} className="flex items-center gap-2 text-xs">
            <span className="w-28 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, dot) => (
                <span key={dot} className={`w-2 h-2 rounded-full ${dot < review[key] ? DOT_COLORS[i] : 'bg-white/10'}`} />
              ))}
            </span>
            <span className="ml-auto text-[#9090a8]">{review[key]}/5</span>
          </li>
        ))}
      </ul>

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
        {METRIC_KEYS.map((key, i) => (
          <li key={key} className="flex items-center gap-2">
            <span className="w-28 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, dot) => (
                <span key={dot} className={`w-1.5 h-1.5 rounded-full ${dot < review[key] ? DOT_COLORS[i] : 'bg-white/10'}`} />
              ))}
            </span>
          </li>
        ))}
      </ul>
      {displayDate && (
        <span className="text-[11px] text-[#9090a8]">
          {edited ? 'Дата редактирования: ' : 'Дата публикации: '}
          {formatDate(displayDate)}
        </span>
      )}
    </div>
  )
}

export function ReviewsPage({ drinks, activeDrink, initialReviews, currentUser, myReview }: ReviewsPageProps) {
  const router = useRouter()
  const { setSearchItems } = useCatalogSearch()
  const [editing, setEditing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => {
    setSearchItems(drinks.map((d) => ({ id: d.id, name: d.name, image_url: d.image_url })))
    return () => setSearchItems([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drinks])

  useEffect(() => { setEditing(false); setFormOpen(false) }, [activeDrink?.id])

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

  function handleClose() {
    setFormOpen(false)
    setEditing(false)
  }

  const adminReview = initialReviews.find((r) => r.from_admin) ?? null
  const userReviews = initialReviews.filter((r) => !r.from_admin)
  const otherReviews = myReview ? userReviews.filter((r) => r.id !== myReview.id) : userReviews

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
    <div className="space-y-6">
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
            <h1 className="font-bold text-[#f0f0f5] text-lg leading-snug truncate">{activeDrink.name}</h1>
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
      <div className="grid sm:grid-cols-2 gap-4">
        {adminReview ? (
          <MetricBars review={adminReview} label="Оценка администратора" />
        ) : (
          <div className="glass-surface rounded-xl p-4 text-sm text-[#9090a8]">
            Администратор ещё не оценил этот напиток.
          </div>
        )}

        {/* Average other users (shown here only, beside admin) */}
        {avgReview ? (
          <MetricBars review={avgReview} label={`Среднее пользователей (${userReviews.length})`} />
        ) : userReviews.length === 0 ? (
          <div className="glass-surface rounded-xl p-4 text-sm text-[#9090a8]">
            Пользовательских отзывов пока нет.
          </div>
        ) : null}
      </div>

      {/* 3. My review / кнопка оставить отзыв */}
      {currentUser ? (
        myReview ? (
          <MyReviewCard review={myReview} onEdit={handleEdit} />
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm font-semibold text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 transition-colors"
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {otherReviews.map((r) => (
            <OtherReviewCard key={r.id} review={r} />
          ))}
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
