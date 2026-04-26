'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, User as UserIcon, MessageSquare, Zap, Plus, LogOut, X } from 'lucide-react'
import { useCatalogSearch } from '@shared/lib/catalog-search'

import type { User } from '@entities/user'
import type { Review } from '@entities/review'
import type { Drink } from '@entities/drink'
import { METRIC_LABELS, METRIC_KEYS, calcRating } from '@entities/review'
import { ROUTES } from '@shared/config/routes'
import { logoutAction } from '@features/auth/model/actions'

interface ProfilePageProps {
  user: User
  reviews: Review[]
  drinks: Drink[]
}

const DOT_COLORS = ['bg-neon-cyan','bg-neon-blue','bg-neon-pink','bg-purple-400','bg-amber-400','bg-neon-green']

function ReviewCard({ review, drink }: { review: Review; drink: Drink | undefined }) {
  const rating = calcRating(review)
  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col">
      <Link
        href={ROUTES.reviews(review.energy_drink_id)}
        className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition-colors"
      >
        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white/5 rounded-lg overflow-hidden">
          {drink?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={drink.image_url} alt={drink.name} className="w-full h-full object-contain p-0.5" />
          ) : (
            <Zap className="w-5 h-5 text-neon-cyan/30" />
          )}
        </div>
        <span className="text-sm font-semibold text-[#f0f0f5] truncate">
          {drink?.name ?? `Напиток #${review.energy_drink_id}`}
        </span>
        <div className="flex items-center gap-1 ml-auto shrink-0">
          <Star className="w-3.5 h-3.5 fill-neon-pink text-neon-pink" />
          <span className="text-sm font-bold text-neon-pink">{review.rating}</span>
        </div>
      </Link>

      <div className="px-4 py-3 flex flex-col gap-1.5">
        {METRIC_KEYS.map((key, i) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-28 text-[#9090a8] truncate">{METRIC_LABELS[key]}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, dot) => (
                <span key={dot} className={`w-1.5 h-1.5 rounded-full ${dot < review[key] ? DOT_COLORS[i] : 'bg-white/10'}`} />
              ))}
            </span>
            <span className="ml-auto text-[#9090a8]">{review[key]}/5</span>
          </div>
        ))}
      </div>
      {review.comment && (
        <p className="px-4 text-sm text-[#f0f0f5] italic">"{review.comment}"</p>
      )}

      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[#9090a8]">
          <Star className="w-3 h-3 fill-neon-cyan text-neon-cyan" />
          Средний балл: <span className="text-neon-cyan font-semibold ml-1">{rating}</span>
        </div>
        {review.created_at && (
          <span className="text-[11px] text-[#9090a8]">
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </span>
        )}
      </div>
    </div>
  )
}

export function ProfilePage({ user, reviews, drinks }: ProfilePageProps) {
  const drinkMap = new Map(drinks.map((d) => [d.id, d]))
  const router = useRouter()
  const [popupOpen, setPopupOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!popupOpen) return
    function onClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [popupOpen])

  const { search } = useCatalogSearch()
  const reviewedIds = new Set(reviews.map((r) => r.energy_drink_id))
  const unreviewedDrinks = drinks.filter((d) => !reviewedIds.has(d.id))
  const filteredReviews = search
    ? reviews.filter((r) => drinkMap.get(r.energy_drink_id)?.name.toLowerCase().includes(search.toLowerCase()))
    : reviews

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="glass rounded-xl px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center shrink-0">
          <UserIcon className="w-6 h-6 text-neon-cyan" />
        </div>
        <div>
          <p className="font-bold text-[#f0f0f5] text-lg">{user.username}</p>
          <p className="text-xs text-[#9090a8]">Роль: {user.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#9090a8]">
            <MessageSquare className="w-4 h-4" />
            {reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neon-red/70 hover:text-neon-red hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </form>
        </div>
      </div>

      {/* Reviews section header */}
      <div className={`glass rounded-xl px-4 py-3 flex items-center justify-between relative${popupOpen ? ' z-20' : ''}`}>
        <h2 className="text-sm font-semibold text-[#f0f0f5] uppercase tracking-wider">Мои отзывы</h2>
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setPopupOpen((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-blue/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>

          {popupOpen && (
            <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#9090a8] uppercase tracking-wider">
                  Выберите напиток
                </span>
                <button onClick={() => setPopupOpen(false)} className="text-[#9090a8] hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {unreviewedDrinks.length === 0 ? (
                <p className="px-4 py-5 text-sm text-[#9090a8] text-center">
                  Вы уже оставили отзыв на все напитки
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto py-1">
                  {unreviewedDrinks.map((drink) => (
                    <li key={drink.id}>
                      <button
                        onClick={() => {
                          router.push(ROUTES.reviews(drink.id))
                          setPopupOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-7 h-7 shrink-0 flex items-center justify-center bg-white/5 rounded overflow-hidden">
                          {drink.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={drink.image_url} alt={drink.name} className="w-full h-full object-contain" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-neon-cyan/40" />
                          )}
                        </div>
                        <span className="text-sm text-[#f0f0f5] truncate">{drink.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews grid */}
      {reviews.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center text-[#9090a8] text-sm">
          Вы ещё не оставили ни одного отзыва — нажмите «Добавить», чтобы выбрать напиток.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((r) => (
            <ReviewCard key={r.id} review={r} drink={drinkMap.get(r.energy_drink_id)} />
          ))}
        </div>
      )}
    </div>
  )
}
