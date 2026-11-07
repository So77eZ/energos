'use client'

// Общая оценка отзыва, 1–5: «насколько вам понравился напиток». Отдельная характеристика,
// не среднее метрик (бэк хранит её как `rating`). Разметка и стили — как у MetricRatingInput.

import { useId, useState, type CSSProperties } from 'react'
import { Icons } from '@shared/ui/icons'

interface OverallRatingInputProps {
  value: number
  onChange: (v: number) => void
  /** Имя поля для FormData. */
  name?: string
  invalid?: boolean
  describedBy?: string
}

export function OverallRatingInput({ value, onChange, name, invalid, describedBy }: OverallRatingInputProps) {
  const [hover, setHover] = useState(0)
  const id = useId()
  const show = hover || value
  const color = 'var(--accent)'

  return (
    <div
      className={`rate-row rate-row-overall${invalid ? ' is-invalid' : ''}`}
      style={{ '--rate-color': color, '--rate-fill': 'var(--accent-fill)', '--rate-ink': 'var(--on-accent)' } as CSSProperties}
      role="radiogroup"
      aria-labelledby={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      data-rating-field={name}
    >
      <div className="rate-row-head">
        <span className="rate-row-icon" style={{ color }}><Icons.star w={18} /></span>
        <span className="rate-row-label" id={id}>Общая оценка · насколько понравился напиток</span>
        <span className="rate-row-val" style={{ color: value ? color : undefined }}>
          {value || '—'}<span className="of">/5</span>
        </span>
      </div>
      <div className="rate-row-buttons" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((v) => {
          const on = v <= show
          return (
            <label
              key={v}
              className={`rate-btn${on ? ' on' : ''}`}
              onMouseEnter={() => setHover(v)}
            >
              <input
                className="rate-input"
                type="radio"
                name={name ?? id}
                value={v}
                checked={value === v}
                onChange={() => onChange(v)}
                onFocus={() => setHover(0)}
                aria-label={`Общая оценка ${v} из 5`}
              />
              <span className="rate-btn-num">{v}</span>
              <span className="rate-btn-icon"><Icons.star w={16} /></span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
