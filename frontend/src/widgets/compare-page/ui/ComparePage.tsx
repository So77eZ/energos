'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HiddenBolt } from '@features/easter-eggs'
import {
  cleanDrinkName,
  EnergyCan,
  splitDrinkBrand,
  TierBadge,
  type EnrichedDrink,
} from '@entities/drink'
import {
  METRIC_COLOR_VARS,
  METRIC_KEYS,
  METRIC_LABELS,
  MetricShapes,
} from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { CompareRadar, COMPARE_COLORS, COMPARE_DASHES } from './CompareRadar'

interface ComparePageProps {
  drinks: EnrichedDrink[]
}

const MAX_SLOTS = 3
const SLOT_KEYS = ['a', 'b', 'c'] as const

function parseInitial(searchParams: URLSearchParams): number[] {
  return SLOT_KEYS
    .map((k) => Number(searchParams.get(k)))
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function ComparePage({ drinks }: ComparePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [picked, setPicked] = useState<number[]>(() => parseInitial(searchParams))
  // «Только различающиеся» — прячет метрики с одинаковым (по показанному, до 0.1)
  // значением у всех сравниваемых, как side-by-side у DNS.
  const [onlyDiffering, setOnlyDiffering] = useState(false)

  // Sync state → URL (so comparisons are shareable).
  useEffect(() => {
    const params = new URLSearchParams()
    picked.forEach((id, i) => params.set(SLOT_KEYS[i], String(id)))
    const qs = params.toString()
    router.replace(qs ? `/compare?${qs}` : '/compare', { scroll: false })
  }, [picked, router])

  // Only drinks WITH metrics are eligible (без отзывов сравнивать нечего).
  const eligible = useMemo(() => drinks.filter((d) => d.metrics != null), [drinks])
  const items = useMemo(
    () =>
      picked
        .map((id) => eligible.find((d) => d.id === id))
        .filter((d): d is EnrichedDrink => Boolean(d?.metrics)),
    [picked, eligible],
  )

  const add = useCallback((id: number) => {
    setPicked((prev) => (prev.includes(id) || prev.length >= MAX_SLOTS ? prev : [...prev, id]))
  }, [])
  const remove = useCallback((id: number) => {
    setPicked((prev) => prev.filter((x) => x !== id))
  }, [])

  // Per-metric winner (highest value) — used to highlight in bars.
  const winners = useMemo(() => {
    const out: Record<string, number | null> = {}
    for (const k of METRIC_KEYS) {
      let best = -Infinity
      let winnerId: number | null = null
      for (const d of items) {
        if (!d.metrics) continue
        const v = d.metrics[k]
        if (v > best) { best = v; winnerId = d.id }
      }
      out[k] = winnerId
    }
    return out
  }, [items])

  // Метрики к показу: при «только различающиеся» оставляем строки, где
  // показанные (округлённые до 0.1) значения не совпадают у всех напитков.
  const visibleMetrics = useMemo(() => {
    if (!onlyDiffering) return METRIC_KEYS
    return METRIC_KEYS.filter((k) => {
      const shown = new Set(items.map((d) => d.metrics![k].toFixed(1)))
      return shown.size > 1
    })
  }, [onlyDiffering, items])

  return (
    <div className="page page-compare">
      <HiddenBolt id="compare" />
      <header className="cmp-head">
        <div>
          <div className="page-eyebrow">A/B/C · АНАЛИЗ</div>
          <h1 className="page-title">Сравнение напитков</h1>
          <p className="page-blurb">
            Поставь рядом до 3 позиций. Радар покажет наложение профилей,
            а в каждой метрике подсвечен победитель.
          </p>
        </div>
        <div className="cmp-counter">
          <span className="cmp-counter-val">{items.length}</span>
          <span className="cmp-counter-of">/ {MAX_SLOTS}</span>
        </div>
      </header>

      <div className="cmp-slots">
        {Array.from({ length: MAX_SLOTS }).map((_, slot) => {
          const d = items[slot]
          if (!d) {
            return (
              <div key={slot} className="cmp-slot-empty">
                <div className="cmp-empty-icon"><Icons.plus w={20} /></div>
                <div className="cmp-empty-lbl">Слот {slot + 1}</div>
                <div className="cmp-empty-hint">Выбери ниже</div>
              </div>
            )
          }
          const blend = d.blend
          const { brand, variant } = splitDrinkBrand(cleanDrinkName(d.name))
          return (
            <div
              key={d.id}
              className="cmp-slot"
              style={{ ['--blend' as string]: blend }}
            >
              <button
                type="button"
                className="cmp-slot-close"
                onClick={() => remove(d.id)}
                aria-label={`Убрать «${variant}» из сравнения`}
              >
                <Icons.x w={12} />
              </button>
              <div className="cmp-slot-vis">
                <div
                  className="cmp-slot-glow"
                  style={{ background: `radial-gradient(circle, rgba(${blend}, 0.4), transparent 70%)` }}
                />
                {d.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image_url} alt={d.name} />
                ) : (
                  <EnergyCan can={d.can} w={120} h={260} />
                )}
              </div>
              <div className="cmp-slot-info">
                <div className="cmp-slot-brand">{brand}</div>
                <div className="cmp-slot-name">{variant}</div>
                <div className="cmp-slot-meta">
                  {d.rating != null && (
                    <span className="cmp-slot-rate"><Icons.star /> {d.rating.toFixed(1)}</span>
                  )}
                  {d.price != null && (
                    <span className="cmp-slot-price">{d.price.toFixed(0)} ₽</span>
                  )}
                  {d.tier && <TierBadge tier={d.tier} size="xs" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {items.length >= 2 && (
        <section className="cmp-radar-section">
          <div className="cmp-section-head">
            <h2 className="section-title">Наложение профилей</h2>
            <span className="section-sub">★ — победитель в каждой метрике</span>
          </div>

          <div className="cmp-radar-stage">
            <CompareRadar
              items={items.map((d) => ({ id: d.id, metrics: d.metrics! }))}
              size={420}
            />
            <div className="cmp-radar-legend">
              {items.map((d, i) => {
                const { brand } = splitDrinkBrand(cleanDrinkName(d.name))
                const dash = COMPARE_DASHES[i]
                const style = dash
                  ? `dashed ${COMPARE_COLORS[i]}`
                  : `solid ${COMPARE_COLORS[i]}`
                return (
                  <div key={d.id} className="cmp-leg-row">
                    <span
                      className="cmp-leg-line"
                      style={{ borderTop: `2px ${style}` }}
                    />
                    <span className="cmp-leg-name">{brand}</span>
                    <span className="cmp-leg-code">
                      {d.rating != null ? `★ ${d.rating.toFixed(1)}` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="cmp-metric-bar">
            <label className="filt-toggle">
              <input
                type="checkbox"
                checked={onlyDiffering}
                onChange={(e) => setOnlyDiffering(e.target.checked)}
              />
              <span className="filt-toggle-track" />
              <span className="filt-toggle-lbl">Только различающиеся</span>
            </label>
          </div>

          <div className="cmp-metric-rows">
            {visibleMetrics.length === 0 ? (
              <div className="cmp-metric-empty">
                Все метрики совпадают у выбранных напитков.
              </div>
            ) : visibleMetrics.map((k) => {
              const Icon = MetricShapes[k]
              return (
                <div key={k} className="cmp-metric-row">
                  <div className="cmp-metric-name" style={{ color: METRIC_COLOR_VARS[k] }}>
                    <span>{Icon && <Icon />}</span>
                    {METRIC_LABELS[k]}
                  </div>
                  <div className="cmp-metric-bars">
                    {items.map((d) => {
                      const v = d.metrics![k]
                      const isWinner = winners[k] === d.id
                      const { brand } = splitDrinkBrand(cleanDrinkName(d.name))
                      return (
                        <div key={d.id} className={`cmp-bar-cell${isWinner ? ' winner' : ''}`}>
                          <div className="cmp-bar-brand">{brand}</div>
                          <div className="cmp-bar">
                            <div
                              className="cmp-bar-fill"
                              style={{ width: `${(v / 5) * 100}%`, background: METRIC_COLOR_VARS[k] }}
                            />
                          </div>
                          <div className="cmp-bar-val">
                            {v.toFixed(1)}
                            {isWinner && <span className="cmp-winner">★</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="cmp-picker">
        <div className="cmp-picker-head">
          <h2 className="section-title">Добавить в сравнение</h2>
          <span className="section-sub">
            Только напитки с отзывами · максимум {MAX_SLOTS}
          </span>
        </div>
        {eligible.length === 0 ? (
          <div className="empty">
            <Icons.beaker />
            <p>Пока ни на один напиток нет отзывов — добавьте оценку, чтобы сравнивать.</p>
          </div>
        ) : (
          <div className="cmp-picker-grid">
            {eligible.map((d) => {
              const inList = picked.includes(d.id)
              const { brand } = splitDrinkBrand(cleanDrinkName(d.name))
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`cmp-pick${inList ? ' in-list' : ''}`}
                  disabled={!inList && picked.length >= MAX_SLOTS}
                  onClick={() => (inList ? remove(d.id) : add(d.id))}
                >
                  <div className="cmp-pick-can">
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image_url} alt={d.name} />
                    ) : (
                      <EnergyCan can={d.can} w={32} h={68} />
                    )}
                  </div>
                  <div className="cmp-pick-info">
                    <div className="cmp-pick-name">{brand}</div>
                    <div className="cmp-pick-rate">
                      <Icons.star w={9} />
                      {d.rating != null ? d.rating.toFixed(1) : '—'}
                      {d.price != null && ` · ${d.price.toFixed(0)}₽`}
                    </div>
                  </div>
                  {inList ? <Icons.check w={14} /> : <Icons.plus w={14} />}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
