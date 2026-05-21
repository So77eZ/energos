'use client'

// Clickable 1–5 rating input for a single metric. Mirrors frontendNew/shared.jsx
// → MetricRatingInput: themed shape icon, hover preview, active glow.

import { useState } from 'react'
import { METRIC_COLOR_VARS, METRIC_LABELS, type ReviewMetrics } from '../model/types'
import { MetricShapes } from './MetricShapes'

interface MetricRatingInputProps {
  metricKey: keyof ReviewMetrics
  value: number
  onChange: (v: number) => void
  /** Hidden numeric input name so the form can be submitted as FormData. */
  name?: string
}

export function MetricRatingInput({ metricKey, value, onChange, name }: MetricRatingInputProps) {
  const Icon = MetricShapes[metricKey]
  const color = METRIC_COLOR_VARS[metricKey]
  const [hover, setHover] = useState(0)
  const show = hover || value

  return (
    <div className="rate-row">
      {name && <input type="hidden" name={name} value={value || ''} />}
      <div className="rate-row-head">
        <span className="rate-row-icon" style={{ color }}>{Icon && <Icon />}</span>
        <span className="rate-row-label">{METRIC_LABELS[metricKey]}</span>
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
              aria-label={`${METRIC_LABELS[metricKey]} ${v}`}
            >
              <span className="rate-btn-num">{v}</span>
              <span className="rate-btn-icon">{Icon && <Icon />}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
