'use client'

import { useId, useState, type CSSProperties } from 'react'
import { METRIC_COLOR_VARS, METRIC_LABELS, type ReviewMetrics } from '../model/types'
import { MetricShapes } from './MetricShapes'

interface MetricRatingInputProps {
  metricKey: keyof ReviewMetrics
  value: number
  onChange: (v: number) => void
  /** Numeric field name for FormData. */
  name?: string
  invalid?: boolean
  describedBy?: string
}

export function MetricRatingInput({ metricKey, value, onChange, name, invalid, describedBy }: MetricRatingInputProps) {
  const Icon = MetricShapes[metricKey]
  const color = METRIC_COLOR_VARS[metricKey]
  const [hover, setHover] = useState(0)
  const id = useId()
  const show = hover || value

  return (
    <div
      className={`rate-row${invalid ? ' is-invalid' : ''}`}
      style={{ '--rate-color': color } as CSSProperties}
      role="radiogroup"
      aria-labelledby={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      data-rating-field={name}
    >
      <div className="rate-row-head">
        <span className="rate-row-icon" style={{ color }}>{Icon && <Icon />}</span>
        <span className="rate-row-label" id={id}>{METRIC_LABELS[metricKey]}</span>
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
                aria-label={`${METRIC_LABELS[metricKey]} ${v} из 5`}
              />
              <span className="rate-btn-num">{v}</span>
              <span className="rate-btn-icon">{Icon && <Icon />}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
