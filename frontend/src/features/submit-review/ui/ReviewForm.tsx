'use client'

import { useActionState, useId, useState } from 'react'
import { Icons } from '@shared/ui/icons'
import { useTheme } from '@shared/lib/theme'
import {
  METRIC_KEYS,
  MetricRatingInput,
  OverallRatingInput,
  type Review,
  type ReviewMetrics,
} from '@entities/review'
import { saveReviewAction } from '../model/actions'
import { getInvalidReviewScoreKeys, REVIEW_SCORE_LABELS } from '../model/review-scores'

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
  const [rating, setRating] = useState(editReview?.rating ?? 0)
  const [comment, setComment] = useState(editReview?.comment ?? '')
  const [submitted, setSubmitted] = useState(false)
  const validationId = useId()
  const { motionOn } = useTheme()

  const isEdit = !!editReview
  const title = isEdit ? 'Изменить отзыв' : 'Оставить отзыв'
  const filled = METRIC_KEYS.filter((k) => metrics[k] > 0).length
  const sum = METRIC_KEYS.reduce((s, k) => s + metrics[k], 0)
  const avg = filled > 0 ? sum / filled : 0
  const missingScores = getInvalidReviewScoreKeys({ rating, ...metrics })
  const showValidation = submitted && missingScores.length > 0

  const setM = (k: keyof ReviewMetrics, v: number) => {
    setMetrics((m) => ({ ...m, [k]: v }))
  }

  return (
    <form
      key={editReview?.id ?? 'new'}
      action={formAction}
      className="rev-form"
      onSubmit={(event) => {
        if (missingScores.length) {
          event.preventDefault()
          setSubmitted(true)
          const group = event.currentTarget.querySelector<HTMLElement>(`[data-rating-field="${missingScores[0]}"]`)
          group?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus({ preventScroll: true })
          group?.scrollIntoView({ block: 'center', behavior: motionOn ? 'smooth' : 'auto' })
        }
      }}
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

      <div className="rev-form-progress">
        <div className="rfp-track">
          <div className="rfp-fill" style={{ width: `${(filled / 6) * 100}%` }} />
        </div>
        <span className="rfp-text">
          {filled}/6 метрик · среднее <b>{avg.toFixed(1)}</b>
        </span>
      </div>

      <div className="rev-form-body">
        {state?.error && <p className="rev-form-error" role="alert">{state.error}</p>}
        {showValidation && (
          <p className="rev-form-error rev-form-validation" id={validationId} role="alert">
            Поставьте оценки: {missingScores.map((key) => REVIEW_SCORE_LABELS[key]).join(', ')}.
          </p>
        )}

        <OverallRatingInput
          value={rating}
          onChange={setRating}
          name="rating"
          invalid={submitted && missingScores.includes('rating')}
          describedBy={showValidation ? validationId : undefined}
        />

        {METRIC_KEYS.map((k) => (
          <MetricRatingInput
            key={k}
            metricKey={k}
            value={metrics[k]}
            onChange={(v) => setM(k, v)}
            name={k}
            invalid={submitted && missingScores.includes(k)}
            describedBy={showValidation && missingScores.includes(k) ? validationId : undefined}
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
            maxLength={2000} // лимит бэка, REVIEW_COMMENT_MAX
          />
        </div>

        <div className="rev-form-actions">
          {onClose && (
            <button type="button" className="cta-ghost" onClick={onClose} disabled={isPending}>
              Отменить
            </button>
          )}
          <button type="submit" className="cta-primary" disabled={isPending}>
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
