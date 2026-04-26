'use client'

import { useActionState, useState } from 'react'
import { Save, Star, Biohazard, Candy, Bubbles, FlaskConical, Shell, BadgeRussianRuble, type LucideIcon } from 'lucide-react'
import { saveReviewAction } from '../model/actions'
import { METRIC_LABELS, METRIC_KEYS, type Review } from '@entities/review'

interface ReviewFormProps {
  drinkId: number
  editReview?: Review | null
}

const METRIC_ICONS: LucideIcon[] = [Biohazard, Candy, Bubbles, FlaskConical, Shell, BadgeRussianRuble]
const METRIC_ICON_COLORS = ['text-neon-cyan', 'text-neon-blue', 'text-neon-pink', 'text-purple-400', 'text-amber-400', 'text-neon-green']

function IconRatingSelector({
  name,
  defaultValue = 3,
  icon: Icon,
  activeColor,
}: {
  name: string
  defaultValue?: number
  icon: LucideIcon
  activeColor: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((val) => (
        <label
          key={val}
          className="cursor-pointer"
          onMouseEnter={() => setHover(val)}
          onMouseLeave={() => setHover(null)}
        >
          <input
            type="radio"
            name={name}
            value={val}
            checked={val === value}
            onChange={() => setValue(val)}
            className="sr-only"
            required
          />
          <Icon
            className={`w-6 h-6 transition-colors ${val <= display ? activeColor : 'text-white/20'}`}
          />
        </label>
      ))}
    </div>
  )
}

function StarRatingSelector({
  name,
  defaultValue = 3,
}: {
  name: string
  defaultValue?: number
}) {
  const [value, setValue] = useState(defaultValue)
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value

  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((val) => (
        <label
          key={val}
          className="cursor-pointer"
          onMouseEnter={() => setHover(val)}
          onMouseLeave={() => setHover(null)}
        >
          <input
            type="radio"
            name={name}
            value={val}
            checked={val === value}
            onChange={() => setValue(val)}
            className="sr-only"
            required
          />
          <Star
            className={`w-6 h-6 transition-colors ${val <= display ? 'fill-neon-cyan text-neon-cyan' : 'text-white/20'}`}
          />
        </label>
      ))}
    </div>
  )
}

export function ReviewForm({ drinkId, editReview }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(saveReviewAction, null)
  const isEdit = !!editReview
  const title = isEdit ? 'Редактировать отзыв' : 'Оставить отзыв'

  return (
    <form
      key={editReview?.id ?? 'new'}
      action={formAction}
      className="glass rounded-xl p-5 flex flex-col gap-5 items-center"
    >
      <h3 className="font-semibold text-[#f0f0f5] w-full text-center">{title}</h3>

      <input type="hidden" name="drink_id" value={drinkId} />
      {isEdit && <input type="hidden" name="review_id" value={editReview.id} />}

      {state?.error && (
        <p className="w-full text-sm text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Overall rating */}
      <div className="flex flex-col gap-2 items-center">
        <span className="text-sm text-[#9090a8]">Общая оценка</span>
        <StarRatingSelector name="rating" defaultValue={editReview?.rating ?? 3} />
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3 w-full">
        {METRIC_KEYS.map((key, i) => {
          const Icon = METRIC_ICONS[i]
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs text-[#9090a8] w-24 shrink-0">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${METRIC_ICON_COLORS[i]}`} />
                {METRIC_LABELS[key]}
              </span>
              <IconRatingSelector
                name={key}
                defaultValue={editReview?.[key] ?? 3}
                icon={Icon}
                activeColor={METRIC_ICON_COLORS[i]}
              />
            </div>
          )
        })}
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm text-[#9090a8]">Комментарий (необязательно)</label>
        <textarea
          name="comment"
          defaultValue={editReview?.comment ?? ''}
          placeholder="Оставьте ваш комментарий..."
          className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-cyan/50 resize-none"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition-colors disabled:opacity-50 mt-1"
      >
        <Save className="w-4 h-4" />
        {isPending ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Отправить'}
      </button>
    </form>
  )
}
