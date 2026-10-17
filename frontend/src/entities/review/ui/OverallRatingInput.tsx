'use client'

// Общая оценка отзыва, 1–5: «насколько вам понравился напиток». Отдельная характеристика,
// не среднее метрик (бэк хранит её как `rating`). Разметка и стили — как у MetricRatingInput.

import { useState } from 'react'
import { Icons } from '@shared/ui/icons'

interface OverallRatingInputProps {
  value: number
  onChange: (v: number) => void
  /** Имя скрытого поля для FormData. */
  name?: string
}

export function OverallRatingInput({ value, onChange, name }: OverallRatingInputProps) {
  const [hover, setHover] = useState(0)
  const show = hover || value
  const color = 'var(--accent)'

  return (
    <div className="rate-row rate-row-overall">
      {name && <input type="hidden" name={name} value={value || ''} />}
      <div className="rate-row-head">
        <span className="rate-row-icon" style={{ color }}><Icons.star w={18} /></span>
        <span className="rate-row-label">Общая оценка · насколько понравился напиток</span>
        <span className="rate-row-val" style={{ color: value ? color : undefined }}>
          {value || '—'}<span className="of">/5</span>
        </span>
      </div>
      <div className="rate-row-buttons" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((v) => {
          const on = v <= show
          return (
            <button
              key={v}
              type="button"
              className={`rate-btn${on ? ' on' : ''}`}
              style={on ? { color, borderColor: color } : undefined}
              onMouseEnter={() => setHover(v)}
              onClick={() => onChange(v)}
              aria-label={`Общая оценка ${v}`}
            >
              <span className="rate-btn-num">{v}</span>
              <span className="rate-btn-icon"><Icons.star w={16} /></span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
