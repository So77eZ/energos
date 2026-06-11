'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HiddenBolt } from '@features/easter-eggs'
import { blendMetricRGB, cleanDrinkName, splitDrinkBrand, type EnrichedDrink } from '@entities/drink'
import {
  METRIC_KEYS,
  METRIC_LABELS,
  type ReviewMetrics,
} from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useCatalogSearch } from '@shared/lib/catalog-search'

interface TasteMapChartProps {
  drinks: EnrichedDrink[]
}

type Axis = keyof ReviewMetrics

const VIEWBOX_W = 920
const VIEWBOX_H = 540
const PAD = 60

const INNER_W = VIEWBOX_W - PAD * 2
const INNER_H = VIEWBOX_H - PAD * 2

const xFor = (v: number) => PAD + ((v - 1) / 4) * INNER_W
const yFor = (v: number) => PAD + INNER_H - ((v - 1) / 4) * INNER_H

export function TasteMapChart({ drinks }: TasteMapChartProps) {
  const router = useRouter()
  const [axisX, setAxisX] = useState<Axis>('sweetness')
  const [axisY, setAxisY] = useState<Axis>('acidity')
  const [hovered, setHovered] = useState<number | null>(null)
  const { search, noSugarOnly } = useCatalogSearch()

  const visible = drinks.filter((d) => {
    if (!d.metrics) return false
    if (noSugarOnly && !d.no_sugar) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="page page-tastemap">
      <HiddenBolt id="tastemap" />
      <div className="tm-head">
        <div>
          <div className="page-eyebrow">ВИЗУАЛИЗАЦИЯ · 2D-ПРОЕКЦИЯ</div>
          <h1 className="page-title">Карта вкусов</h1>
          <p className="page-blurb">
            Каждая точка — напиток. Близкие точки имеют похожий профиль по выбранным осям.
          </p>
        </div>
        <div className="tm-axis-pickers">
          <label className="axis-pick">
            <span className="axis-pick-lbl">ОСЬ X</span>
            <select value={axisX} onChange={(e) => setAxisX(e.target.value as Axis)}>
              {METRIC_KEYS.map((k) => (
                <option key={k} value={k}>{METRIC_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <label className="axis-pick">
            <span className="axis-pick-lbl">ОСЬ Y</span>
            <select value={axisY} onChange={(e) => setAxisY(e.target.value as Axis)}>
              {METRIC_KEYS.map((k) => (
                <option key={k} value={k}>{METRIC_LABELS[k]}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="tm-stage">
          <div className="empty">
            <Icons.beaker />
            <p>{drinks.length === 0
              ? 'Добавьте напитки и хотя бы один отзыв — они появятся на карте.'
              : 'Ничего не найдено — попробуйте изменить фильтр.'}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="tm-stage">
            <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} width="100%" preserveAspectRatio="xMidYMid meet">
              {/* grid + tick labels for each integer value 1..5 */}
              {[1, 2, 3, 4, 5].map((v) => (
                <g key={v}>
                  <line x1={xFor(v)} y1={PAD} x2={xFor(v)} y2={VIEWBOX_H - PAD} stroke="var(--radar-grid)" strokeDasharray="2 4" />
                  <line x1={PAD} y1={yFor(v)} x2={VIEWBOX_W - PAD} y2={yFor(v)} stroke="var(--radar-grid)" strokeDasharray="2 4" />
                  <text x={xFor(v)} y={VIEWBOX_H - PAD + 18} fill="var(--txt-dim)" fontFamily="'JetBrains Mono', monospace" fontSize="10" textAnchor="middle">{v}</text>
                  <text x={PAD - 10} y={yFor(v) + 4} fill="var(--txt-dim)" fontFamily="'JetBrains Mono', monospace" fontSize="10" textAnchor="end">{v}</text>
                </g>
              ))}

              {/* main axes */}
              <line x1={PAD} y1={VIEWBOX_H - PAD} x2={VIEWBOX_W - PAD} y2={VIEWBOX_H - PAD} stroke="var(--line-strong)" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={VIEWBOX_H - PAD} stroke="var(--line-strong)" />
              <text x={VIEWBOX_W - PAD} y={VIEWBOX_H - PAD + 42} textAnchor="end" fill="var(--accent)" fontFamily="'JetBrains Mono', monospace" fontSize="11" letterSpacing="1">
                {METRIC_LABELS[axisX].toUpperCase()} →
              </text>
              <text x={PAD + 8} y={PAD - 12} fill="var(--accent)" fontFamily="'JetBrains Mono', monospace" fontSize="11" letterSpacing="1">
                ↑ {METRIC_LABELS[axisY].toUpperCase()}
              </text>

              {/* quadrant labels — decorative */}
              <text x={PAD + 24} y={PAD + 30} fill="var(--c-cyan)" fontSize="9" opacity="0.5" fontFamily="'JetBrains Mono', monospace">Q1: МЯГКО</text>
              <text x={VIEWBOX_W - PAD - 100} y={PAD + 30} fill="var(--c-pink)" fontSize="9" opacity="0.5" fontFamily="'JetBrains Mono', monospace">Q2: ИНТЕНСИВНО</text>
              <text x={PAD + 24} y={VIEWBOX_H - PAD - 12} fill="var(--c-amber)" fontSize="9" opacity="0.5" fontFamily="'JetBrains Mono', monospace">Q3: НЕЙТРАЛЬНО</text>
              <text x={VIEWBOX_W - PAD - 110} y={VIEWBOX_H - PAD - 12} fill="var(--c-green)" fontSize="9" opacity="0.5" fontFamily="'JetBrains Mono', monospace">Q4: СБАЛАНСИРОВАНО</text>

              {/* data points + hover tooltip per drink */}
              {visible.map((d) => {
                const metrics = d.metrics!
                const cx = xFor(metrics[axisX])
                const cy = yFor(metrics[axisY])
                const blend = blendMetricRGB(metrics)
                const isHovered = hovered === d.id
                const cleanedName = cleanDrinkName(d.name).slice(0, 22)
                const ratingText = d.rating != null ? `★ ${d.rating.toFixed(1)}` : ''
                const priceText = d.price != null ? `${d.price.toFixed(0)}₽` : ''
                const subtitle = [ratingText, priceText].filter(Boolean).join(' · ')
                return (
                  <g
                    key={d.id}
                    onMouseEnter={() => setHovered(d.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => router.push(ROUTES.reviews(d.id))}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={cx} cy={cy} r={isHovered ? 16 : 10}
                      fill={`rgba(${blend}, ${isHovered ? 0.5 : 0.25})`}
                      stroke={`rgb(${blend})`} strokeWidth="2"
                    />
                    <circle cx={cx} cy={cy} r={3} fill={`rgb(${blend})`} />
                    {isHovered && (
                      <g pointerEvents="none">
                        <rect x={cx + 18} y={cy - 26} width="180" height="42" rx="6" fill="var(--bg-card)" stroke={`rgb(${blend})`} />
                        <text x={cx + 26} y={cy - 12} fill="var(--txt)" fontSize="11" fontFamily="'Exo 2', sans-serif" fontWeight="600">{cleanedName}</text>
                        {subtitle && (
                          <text x={cx + 26} y={cy + 4} fill="var(--txt-dim)" fontSize="9" fontFamily="'JetBrains Mono', monospace">{subtitle}</text>
                        )}
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          <div className="tm-legend">
            <div className="tm-legend-head">
              <span><Icons.pulse w={14} /> ВСЕ ТОЧКИ</span>
              <span className="tm-dim">{visible.length} напитков</span>
            </div>
            <div className="tm-legend-grid">
              {visible.map((d) => {
                const blend = blendMetricRGB(d.metrics)
                const { brand } = splitDrinkBrand(cleanDrinkName(d.name))
                const xVal = d.metrics![axisX]
                const yVal = d.metrics![axisY]
                return (
                  <button
                    type="button"
                    key={d.id}
                    className={`tm-legend-item${hovered === d.id ? ' hovered' : ''}`}
                    onMouseEnter={() => setHovered(d.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => router.push(ROUTES.reviews(d.id))}
                  >
                    <span
                      className="tm-dot"
                      style={{ background: `rgb(${blend})`, boxShadow: `0 0 8px rgb(${blend})` }}
                    />
                    <span className="tm-legend-name">{brand}</span>
                    <span className="tm-legend-dim">{xVal.toFixed(1)}·{yVal.toFixed(1)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
