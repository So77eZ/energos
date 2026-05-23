'use client'

import { useActionState, useState } from 'react'
import { Icons } from '@shared/ui/icons'
import { METRIC_KEYS, MetricRatingInput, type Review, type ReviewMetrics } from '@entities/review'
import { saveReviewAction } from '../model/actions'

interface ReviewFormProps {
  drinkId: number
  drinkName: string
  editReview?: Review | null
  onClose?: () => void
}

const EMPTY_METRICS: ReviewMetrics = {
  acidity: 0,
  sweetness: 0,
  carbonation: 0,
  concentration: 0,
  aftertaste: 0,
  price_quality: 0,
}

function pickInitialMetrics(review: Review | null | undefined): ReviewMetrics {
  if (!review) return EMPTY_METRICS
  return {
    acidity: review.acidity,
    sweetness: review.sweetness,
    carbonation: review.carbonation,
    concentration: review.concentration,
    aftertaste: review.aftertaste,
    price_quality: review.price_quality,
  }
}

export function ReviewForm({ drinkId, drinkName, editReview, onClose }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(saveReviewAction, null)
  const [metrics, setMetrics] = useState<ReviewMetrics>(() => pickInitialMetrics(editReview))
  const [comment, setComment] = useState(editReview?.comment ?? '')

  const isEdit = !!editReview
  const title = isEdit ? 'Изменить отзыв' : 'Оставить отзыв'
  const filled = METRIC_KEYS.filter((k) => metrics[k] > 0).length
  const sum = METRIC_KEYS.reduce((s, k) => s + metrics[k], 0)
  const avg = filled > 0 ? sum / filled : 0
  const canSubmit = filled === 6 && !isPending

  const setM = (k: keyof ReviewMetrics, v: number) => {
    setMetrics((m) => ({ ...m, [k]: v }))
  }

  return (
    <form
      key={editReview?.id ?? 'new'}
      action={formAction}
      className="rev-form"
    >
      <header className="rev-form-head">
        <div>
          <h3 className="rev-form-title">{title}</h3>
          <div className="rev-form-sub">на «{drinkName}»</div>
        </div>
        {onClose && (
          <button type="button" className="rev-form-close" onClick={onClose} aria-label="Закрыть форму">
            <Icons.x w={16} />
          </button>
        )}
      </header>

      <input type="hidden" name="drink_id" value={drinkId} />
      {isEdit && <input type="hidden" name="review_id" value={editReview.id} />}
      {isEdit && editReview.user_id != null && (
        <input type="hidden" name="user_id" value={editReview.user_id} />
      )}

      <div className="rev-form-progress">
        <div className="rfp-track">
          <div className="rfp-fill" style={{ width: `${(filled / 6) * 100}%` }} />
        </div>
        <span className="rfp-text">
          {filled}/6 метрик · среднее <b>{avg.toFixed(1)}</b>
        </span>
      </div>

      <div className="rev-form-body">
        {state?.error && <p className="rev-form-error">{state.error}</p>}

        {METRIC_KEYS.map((k) => (
          <MetricRatingInput
            key={k}
            metricKey={k}
            value={metrics[k]}
            onChange={(v) => setM(k, v)}
            name={k}
          />
        ))}

        <div className="rev-form-field">
          <label className="rev-form-label" htmlFor="review-comment">
            Комментарий <span className="opt">(необязательно)</span>
          </label>
          <textarea
            id="review-comment"
            name="comment"
            className="rev-form-textarea"
            placeholder="Что зашло? Что не зашло? Любые ощущения…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <div className="rev-form-actions">
          {onClose && (
            <button type="button" className="cta-ghost" onClick={onClose} disabled={isPending}>
              Отменить
            </button>
          )}
          <button type="submit" className="cta-primary" disabled={!canSubmit}>
            {isPending ? (
              <>Сохранение…</>
            ) : (
              <>
                {isEdit ? 'Сохранить изменения' : 'Опубликовать отзыв'} <Icons.check w={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
