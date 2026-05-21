// Compact 6-column visualization of a review's metrics.
// Each metric gets a 5-cell vertical bar coloured per its CSS var.

import {
  METRIC_COLOR_VARS,
  METRIC_KEYS,
  METRIC_LABELS,
  METRIC_SHORT,
  type ReviewMetrics,
} from '../model/types'

interface MiniMetricsProps {
  metrics: ReviewMetrics
  showLabels?: boolean
}

const LEVELS = [5, 4, 3, 2, 1] as const

export function MiniMetrics({ metrics, showLabels = true }: MiniMetricsProps) {
  return (
    <div className="mini-metrics" aria-hidden>
      {METRIC_KEYS.map((k) => {
        const v = metrics[k]
        const color = METRIC_COLOR_VARS[k]
        return (
          <div key={k} className="mm-col" title={`${METRIC_LABELS[k]}: ${v.toFixed(1)}`}>
            <div className="mm-track">
              {LEVELS.map((level) => (
                <div
                  key={level}
                  className={`mm-cell${v >= level ? ' on' : ''}`}
                  style={{ background: v >= level ? color : undefined, color }}
                />
              ))}
            </div>
            {showLabels && (
              <div className="mm-lbl" style={{ color: v >= 4 ? color : undefined }}>
                {METRIC_SHORT[k]}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
