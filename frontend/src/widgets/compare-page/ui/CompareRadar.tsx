// 6-axis radar overlaying 2–3 drink profiles with distinct colors/dash patterns.
// Mirrors frontendNew/page-compare.jsx → ComparisonRadar.

import { METRIC_KEYS, METRIC_SHORT, type ReviewMetrics } from '@entities/review'

interface CompareRadarProps {
  items: Array<{ id: number; metrics: ReviewMetrics }>
  size?: number
}

const STROKE_COLORS = ['var(--accent)', 'var(--c-pink)', 'var(--c-amber)']
const FILL_COLORS = [
  'rgba(var(--accent-rgb), 0.18)',
  'rgba(255, 46, 136, 0.15)',
  'rgba(251, 191, 36, 0.12)',
]
const DASH_PATTERNS: Array<string | undefined> = [undefined, '4 4', '2 6']

const RING_LEVELS = [1, 2, 3, 4, 5] as const

export function CompareRadar({ items, size = 420 }: CompareRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 50

  const axes = METRIC_KEYS.map((k, i) => {
    const a = -Math.PI / 2 + i * (Math.PI / 3)
    return { k, a, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }
  })

  const ptsFor = (m: ReviewMetrics) =>
    axes
      .map((p) => {
        const v = m[p.k] / 5
        return { x: cx + Math.cos(p.a) * R * v, y: cy + Math.sin(p.a) * R * v }
      })
      .map((p) => `${p.x},${p.y}`)
      .join(' ')

  const rings = RING_LEVELS.map((level) => {
    const r = (R * level) / 5
    return axes.map((p) => `${cx + Math.cos(p.a) * r},${cy + Math.sin(p.a) * r}`).join(' ')
  })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--radar-grid)" strokeWidth={1} />
      ))}
      {axes.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--radar-grid)" strokeWidth={1} />
      ))}
      {items.map((d, i) => (
        <polygon
          key={d.id}
          points={ptsFor(d.metrics)}
          fill={FILL_COLORS[i]}
          stroke={STROKE_COLORS[i]}
          strokeWidth={2}
          strokeDasharray={DASH_PATTERNS[i]}
        />
      ))}
      {axes.map((p, i) => {
        const lx = cx + Math.cos(p.a) * (R + 22)
        const ly = cy + Math.sin(p.a) * (R + 22)
        return (
          <g key={i}>
            <text
              x={lx} y={ly}
              fontSize={11} fill="var(--txt)"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="'JetBrains Mono', monospace" letterSpacing={1.5}
            >
              {METRIC_SHORT[p.k]}
            </text>
            <text
              x={lx} y={ly + 12}
              fontSize={9} fill="var(--txt-dim)"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="'JetBrains Mono', monospace"
            >
              {items.map((d) => d.metrics[p.k].toFixed(1)).join(' · ')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Stroke colors matching CompareRadar's items[i] — exported for legend rendering. */
export const COMPARE_COLORS = STROKE_COLORS
export const COMPARE_DASHES = DASH_PATTERNS
