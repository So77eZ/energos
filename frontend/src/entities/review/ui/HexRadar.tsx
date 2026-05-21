// 6-axis hexagonal radar chart for ReviewMetrics.
// Ported from frontendNew/shared.jsx HexRadar.

import {
  METRIC_COLOR_VARS,
  METRIC_KEYS,
  METRIC_SHORT,
  calcRating,
  type ReviewMetrics,
} from '../model/types'

interface HexRadarProps {
  metrics: ReviewMetrics
  size?: number
  /** Optional second set drawn dashed for comparison. */
  compareMetrics?: ReviewMetrics | null
  compareColor?: string
}

const RING_LEVELS = [1, 2, 3, 4, 5] as const

export function HexRadar({ metrics, size = 220, compareMetrics = null, compareColor = 'var(--c-pink)' }: HexRadarProps) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 28

  const axes = METRIC_KEYS.map((k, i) => {
    const a = -Math.PI / 2 + i * (Math.PI / 3)
    return { k, a, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }
  })

  const ptsFor = (mm: ReviewMetrics) =>
    axes.map((p) => {
      const v = mm[p.k] / 5
      return {
        x: cx + Math.cos(p.a) * R * v,
        y: cy + Math.sin(p.a) * R * v,
        col: METRIC_COLOR_VARS[p.k],
      }
    })

  const valPoints = ptsFor(metrics)
  const cmpPoints = compareMetrics ? ptsFor(compareMetrics) : null

  const rings = RING_LEVELS.map((level) => {
    const r = (R * level) / 5
    return axes.map((p) => `${cx + Math.cos(p.a) * r},${cy + Math.sin(p.a) * r}`).join(' ')
  })
  const valPoly = valPoints.map((p) => `${p.x},${p.y}`).join(' ')
  const cmpPoly = cmpPoints?.map((p) => `${p.x},${p.y}`).join(' ') ?? null

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="radar">
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--radar-grid)" strokeWidth={1} />
      ))}
      {axes.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--radar-grid)" strokeWidth={1} />
      ))}
      {cmpPoly && (
        <polygon points={cmpPoly} fill="rgba(255,46,136,0.10)" stroke={compareColor} strokeWidth={1.5} strokeDasharray="3 3" />
      )}
      <polygon points={valPoly} fill="rgba(var(--accent-rgb),0.18)" stroke="var(--accent)" strokeWidth={1.5} />
      {valPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={p.col} stroke="var(--bg-base)" strokeWidth={1.5} />
      ))}
      {axes.map((p, i) => {
        const lx = cx + Math.cos(p.a) * (R + 14)
        const ly = cy + Math.sin(p.a) * (R + 14)
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fontSize={10}
            fill="var(--txt-dim)"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing={1}
          >
            {METRIC_SHORT[p.k]}
          </text>
        )
      })}
      <text x={cx} y={cy - 5} textAnchor="middle" fontFamily="'Russo One', sans-serif" fontWeight={700} fontSize={22} fill="var(--txt)">
        {calcRating(metrics).toFixed(1)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize={8} fill="var(--txt-dim)" letterSpacing={1}>
        СРЕДНИЙ
      </text>
    </svg>
  )
}
