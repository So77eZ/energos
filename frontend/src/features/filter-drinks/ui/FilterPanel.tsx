'use client'

import { useEffect, useRef } from 'react'
import { useCatalogSearch, type FilterAnchor } from '@shared/lib/catalog-search'
import { TIER_COLORS } from '@entities/drink'
import type { Tier } from '@entities/drink'
import { Icons } from '@shared/ui/icons'

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D']

interface FilterPanelProps {
  /** Какой триггер обслуживает этот инстанс. Popover рендерится только когда
   *  filterAnchor совпадает — так один стейт `filterOpen` управляет двумя
   *  co-located popover'ами (под SortBar и под шапкой). */
  anchor: FilterAnchor
  /** Якорь снаружи (filter-btn) — нужен для click-outside, чтобы клик по
   *  самой кнопке не закрывал popover мгновенно. */
  anchorRef?: React.RefObject<HTMLElement | null>
}

export function FilterPanel({ anchor, anchorRef }: FilterPanelProps) {
  const {
    filterOpen, setFilterOpen, filterAnchor,
    tiers, setTiers,
    priceRange, setPriceRange,
    onlyNew, setOnlyNew,
    noSugarOnly, setNoSugarOnly,
    priceBounds,
  } = useCatalogSearch()

  const popRef = useRef<HTMLDivElement | null>(null)
  const shown = filterOpen && filterAnchor === anchor

  // Esc — закрыть; клик вне popover'a и вне filter-btn — закрыть.
  useEffect(() => {
    if (!shown) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (popRef.current?.contains(target)) return
      if (anchorRef?.current?.contains(target)) return
      setFilterOpen(false)
    }
    window.addEventListener('keydown', onKey)
    // mousedown а не click — закрываемся раньше, чем сработают onClick'и внутри popover.
    // Но это ломает выбор: используем click с capture=false, выставляем listener
    // в следующий tick чтобы текущий клик (открывающий) не закрыл сразу.
    const t = setTimeout(() => window.addEventListener('click', onClick), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
      clearTimeout(t)
    }
  }, [shown, setFilterOpen, anchorRef])

  if (!shown) return null

  const [boundsMin, boundsMax] = priceBounds
  const lo = priceRange?.[0] ?? boundsMin
  const hi = priceRange?.[1] ?? boundsMax
  const hasAny = tiers.length > 0 || priceRange != null || onlyNew || noSugarOnly

  function toggleTier(t: Tier) {
    setTiers(tiers.includes(t) ? tiers.filter((x) => x !== t) : [...tiers, t])
  }

  function onLoChange(v: number) {
    const next: [number, number] = [Math.min(v, hi), hi]
    setPriceRange(next[0] === boundsMin && next[1] === boundsMax ? null : next)
  }
  function onHiChange(v: number) {
    const next: [number, number] = [lo, Math.max(v, lo)]
    setPriceRange(next[0] === boundsMin && next[1] === boundsMax ? null : next)
  }

  function resetAll() {
    setTiers([])
    setPriceRange(null)
    setOnlyNew(false)
    setNoSugarOnly(false)
  }

  return (
    <div
      ref={popRef}
      className="filter-pop"
      role="dialog"
      aria-label="Фильтры каталога"
    >
      <div className="filter-pop-head">
        <span className="filter-pop-title">ФИЛЬТРЫ</span>
        <button
          type="button"
          className="filter-pop-close"
          onClick={() => setFilterOpen(false)}
          aria-label="Закрыть"
        >
          <Icons.x w={12} />
        </button>
      </div>

      <div className="filt-section">
        <div className="filt-lbl">ТИР</div>
        <div className="filt-chip-row">
          {TIERS.map((t) => {
            const on = tiers.includes(t)
            return (
              <button
                key={t}
                type="button"
                className={`filt-chip${on ? ' on' : ''}`}
                onClick={() => toggleTier(t)}
                style={on ? { color: TIER_COLORS[t], borderColor: TIER_COLORS[t] } : undefined}
                aria-pressed={on}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      <div className="filt-section">
        <div className="filt-row">
          <span className="filt-lbl">ЦЕНА</span>
          <span className="filt-range-val">
            {Math.round(lo)} — {Math.round(hi)} ₽
          </span>
        </div>
        <div className="filt-range">
          <div className="filt-range-track" />
          <div
            className="filt-range-fill"
            style={{
              left: `${((lo - boundsMin) / (boundsMax - boundsMin)) * 100}%`,
              right: `${100 - ((hi - boundsMin) / (boundsMax - boundsMin)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={boundsMin}
            max={boundsMax}
            value={lo}
            onChange={(e) => onLoChange(Number(e.target.value))}
            aria-label="Минимальная цена"
          />
          <input
            type="range"
            min={boundsMin}
            max={boundsMax}
            value={hi}
            onChange={(e) => onHiChange(Number(e.target.value))}
            aria-label="Максимальная цена"
          />
        </div>
      </div>

      <div className="filt-section filt-toggles">
        <label className="filt-toggle">
          <input
            type="checkbox"
            checked={noSugarOnly}
            onChange={(e) => setNoSugarOnly(e.target.checked)}
          />
          <span className="filt-toggle-track" />
          <span className="filt-toggle-lbl">Без сахара</span>
        </label>
        <label className="filt-toggle">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
          />
          <span className="filt-toggle-track" />
          <span className="filt-toggle-lbl">Только новые</span>
        </label>
      </div>

      {hasAny && (
        <div className="filter-pop-foot">
          <button type="button" className="filt-reset" onClick={resetAll}>
            Сбросить все
          </button>
        </div>
      )}
    </div>
  )
}
