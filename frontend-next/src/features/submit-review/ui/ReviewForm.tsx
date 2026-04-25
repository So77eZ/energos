'use client'

import { useActionState } from 'react'
import { Send } from 'lucide-react'
import { saveReviewAction } from '../model/actions'
import { METRIC_LABELS, METRIC_KEYS, type Review } from '@entities/review'

interface ReviewFormProps {
  drinkId: number
  editReview?: Review | null
}

const METRIC_COLORS = [
  'peer-checked:border-neon-cyan  peer-checked:bg-neon-cyan/20  peer-checked:text-neon-cyan',
  'peer-checked:border-neon-blue  peer-checked:bg-neon-blue/20  peer-checked:text-neon-blue',
  'peer-checked:border-neon-pink  peer-checked:bg-neon-pink/20  peer-checked:text-neon-pink',
  'peer-checked:border-purple-400 peer-checked:bg-purple-400/20 peer-checked:text-purple-400',
  'peer-checked:border-amber-400  peer-checked:bg-amber-400/20  peer-checked:text-amber-400',
  'peer-checked:border-neon-green peer-checked:bg-neon-green/20 peer-checked:text-neon-green',
]

function RatingSelector({
  name,
  defaultValue = 3,
  colorClass,
}: {
  name: string
  defaultValue?: number
  colorClass: string
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((val) => (
        <label key={val} className="group cursor-pointer">
          <input
            type="radio"
            name={name}
            value={val}
            defaultChecked={val === defaultValue}
            className="sr-only peer"
            required
          />
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all select-none
              border-white/10 bg-white/5 text-[#9090a8]
              group-hover:border-white/30 group-hover:text-[#f0f0f5]
              peer-checked:scale-110 peer-checked:shadow-sm
              ${colorClass}`}
          >
            {val}
          </span>
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
        <RatingSelector
          name="rating"
          defaultValue={editReview?.rating ?? 3}
          colorClass="peer-checked:border-neon-cyan peer-checked:bg-neon-cyan/20 peer-checked:text-neon-cyan"
        />
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3 w-full">
        {METRIC_KEYS.map((key, i) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-xs text-[#9090a8] w-24 shrink-0">{METRIC_LABELS[key]}</span>
            <RatingSelector
              name={key}
              defaultValue={editReview?.[key] ?? 3}
              colorClass={METRIC_COLORS[i]}
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 transition-colors disabled:opacity-50 mt-1"
      >
        <Send className="w-4 h-4" />
        {isPending ? 'Сохранение…' : isEdit ? 'Сохранить изменения' : 'Отправить'}
      </button>
    </form>
  )
}
