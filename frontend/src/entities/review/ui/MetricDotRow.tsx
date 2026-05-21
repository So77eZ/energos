// Read-only horizontal display of a single metric: shape icon + label + 5 themed
// dots filled to the metric value, plus the numeric value at the end.
// Ported from frontendNew/shared.jsx → MetricDotRow.

import { METRIC_COLOR_VARS, METRIC_LABELS, type ReviewMetrics } from '../model/types'
import { MetricShapes, type MetricShapeKey } from './MetricShapes'

interface MetricDotRowProps {
  metricKey: keyof ReviewMetrics
  value: number
  /** Optional rounding of the numeric value (default: round to 1 decimal). */
  displayValue?: string | number
}

export function MetricDotRow({ metricKey, value, displayValue }: MetricDotRowProps) {
  const Icon = MetricShapes[metricKey as MetricShapeKey]
  const color = METRIC_COLOR_VARS[metricKey]
  const rounded = Math.round(value)
  const labelValue = displayValue ?? (Number.isInteger(value) ? value : value.toFixed(1))

  return (
    <div className="dot-row">
      <div className="dot-row-label">
        <span className="dot-row-icon" style={{ color }}>{Icon && <Icon />}</span>
        <span className="dot-row-name">{METRIC_LABELS[metricKey]}</span>
      </div>
      <div className="dot-row-dots">
        {[1, 2, 3, 4, 5].map((v) => (
          <span
            key={v}
            className={`dot-row-dot${v <= rounded ? ' on' : ''}`}
            style={{ color: v <= rounded ? color : undefined }}
          >
            {Icon && <Icon />}
          </span>
        ))}
        <span className="dot-row-val" style={{ color }}>{labelValue}</span>
      </div>
    </div>
  )
}
