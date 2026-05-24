'use client'

import Link from 'next/link'
import { ROUTES } from '@shared/config/routes'
import { METRIC_COLOR_VARS, METRIC_KEYS, METRIC_SHORT } from '@entities/review'
import type { EnrichedDrink } from '@entities/drink'
import { cleanDrinkName, splitDrinkBrand } from '@entities/drink'

interface HeatmapViewProps {
  drinks: EnrichedDrink[]
}

// RGB-тройки для метрик в том же порядке что METRIC_KEYS. Дублируется с
// METRIC_RGB из entities/drink/lib/enrich.ts, но локальное определение проще
// чем экспортировать private-константу ради одного потребителя.
const METRIC_RGB: ReadonlyArray<[number, number, number]> = [
  [0, 229, 255],   // acidity      — cyan
  [77, 150, 255],  // sweetness    — blue
  [255, 46, 136],  // carbonation  — pink
  [192, 132, 252], // concentration — purple
  [251, 191, 36],  // aftertaste   — amber
  [0, 255, 157],   // price_quality — green
]

export function HeatmapView({ drinks }: HeatmapViewProps) {
  return (
    <div className="heatmap">
      <div className="heatmap-head">
        <div className="hm-cell hm-cell-head">НАПИТОК</div>
        {METRIC_KEYS.map((k, i) => (
          <div key={k} className="hm-cell hm-cell-head" style={{ color: METRIC_COLOR_VARS[k] }}>
            {METRIC_SHORT[k]}
          </div>
        ))}
        <div className="hm-cell hm-cell-head" style={{ color: 'var(--c-amber)' }}>★</div>
        <div className="hm-cell hm-cell-head">₽</div>
      </div>
      {drinks.map((d, i) => {
        const cleaned = cleanDrinkName(d.name)
        const split = splitDrinkBrand(cleaned)
        return (
          <Link key={d.id} href={ROUTES.reviews(d.id)} className="heatmap-row">
            <div className="hm-cell hm-name">
              <span className="hm-rank">#{String(i + 1).padStart(2, '0')}</span>
              <span className="hm-brand">{split.brand}</span>
              <span className="hm-variant">{split.variant}</span>
              {d.no_sugar && <span className="hm-tag micro-tag micro-lime">ZERO</span>}
            </div>
            {METRIC_KEYS.map((k, j) => {
              const v = d.metrics?.[k] ?? 0
              const [r, g, b] = METRIC_RGB[j]
              // alpha = (v/5)^2 * 0.55 — квадратичная шкала, чтобы низкие
              // значения почти не подсвечивались, а высокие были «горячие».
              const alpha = v > 0 ? Math.pow(v / 5, 2) * 0.55 : 0
              const color = v >= 4 ? METRIC_COLOR_VARS[k] : v >= 3 ? 'var(--txt)' : 'var(--txt-dim)'
              return (
                <div
                  key={k}
                  className="hm-cell hm-metric"
                  style={{
                    background: `linear-gradient(180deg, rgba(${r},${g},${b},${alpha}), transparent)`,
                    color,
                  }}
                >
                  {v > 0 ? v.toFixed(1) : '—'}
                </div>
              )
            })}
            <div className="hm-cell hm-rate" style={{ color: 'var(--c-amber)' }}>
              {d.rating != null ? d.rating.toFixed(1) : '—'}
            </div>
            <div className="hm-cell hm-price" style={{ color: 'var(--c-pink)' }}>
              {d.price != null ? d.price.toFixed(0) : '—'}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
