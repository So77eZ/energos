'use client'

import { useRef } from 'react'
import { Icons } from '@shared/ui/icons'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'
import { FilterPanel } from './FilterPanel'

type SortKey = 'rating' | 'fresh' | 'reviews' | 'price'
type Direction = 'asc' | 'desc'

interface SortTab {
  key: SortKey
  lbl: string
  hint: string
  defaultDir: Direction
}

const TABS: SortTab[] = [
  { key: 'rating',  lbl: 'По рейтингу', hint: '5 ⇄ 1',   defaultDir: 'desc' },
  { key: 'fresh',   lbl: 'По свежести', hint: 'дата ⇄',  defaultDir: 'desc' },
  { key: 'reviews', lbl: 'По отзывам',  hint: 'кол-во ⇄', defaultDir: 'desc' },
  { key: 'price',   lbl: 'По цене',     hint: '₽ ⇄',     defaultDir: 'asc' },
]

function parseSort(sort: SortOption): { key: SortKey | null; dir: Direction } {
  if (sort === 'rating_desc') return { key: 'rating', dir: 'desc' }
  if (sort === 'rating_asc')  return { key: 'rating', dir: 'asc' }
  if (sort === 'fresh_desc')  return { key: 'fresh', dir: 'desc' }
  if (sort === 'fresh_asc')   return { key: 'fresh', dir: 'asc' }
  if (sort === 'reviews_desc') return { key: 'reviews', dir: 'desc' }
  if (sort === 'reviews_asc')  return { key: 'reviews', dir: 'asc' }
  if (sort === 'price_asc')   return { key: 'price', dir: 'asc' }
  if (sort === 'price_desc')  return { key: 'price', dir: 'desc' }
  return { key: null, dir: 'desc' }
}

function combine(key: SortKey, dir: Direction): SortOption {
  return `${key}_${dir}` as SortOption
}

export function SortBar() {
  const {
    sort, setSort,
    tiers, priceRange, onlyNew, noSugarOnly,
    filterOpen, setFilterOpen, filterAnchor, setFilterAnchor,
    view, setView,
  } = useCatalogSearch()
  const { key: activeKey, dir: activeDir } = parseSort(sort)
  const isAll = sort === 'name'
  // Активные оси фильтра: тиры, цена, only-new, no-sugar.
  const activeFilterCount =
    (tiers.length > 0 ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (noSugarOnly ? 1 : 0)

  const filterBtnRef = useRef<HTMLButtonElement | null>(null)

  function pickTab(tab: SortTab) {
    if (activeKey === tab.key) {
      const nextDir: Direction = activeDir === 'desc' ? 'asc' : 'desc'
      setSort(combine(tab.key, nextDir))
    } else {
      setSort(combine(tab.key, tab.defaultDir))
    }
  }

  function resetSort() {
    setSort('name')
  }

  return (
    <div className="sortbar">
      <div className="sort-tabs" role="tablist">
        {TABS.map((t) => {
          const active = activeKey === t.key
          const arrow = active ? (activeDir === 'desc' ? ' ↓' : ' ↑') : ''
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              className={`sort-tab${active ? ' active' : ''}`}
              onClick={() => pickTab(t)}
            >
              <span className="sort-tab-lbl">{t.lbl}{arrow}</span>
              <span className="sort-tab-hint">{t.hint}</span>
            </button>
          )
        })}
        <button
          type="button"
          aria-selected={isAll}
          className={`sort-tab${isAll ? ' active' : ''}`}
          onClick={resetSort}
        >
          <span className="sort-tab-lbl">Все</span>
          <span className="sort-tab-hint">по названию</span>
        </button>
      </div>

      <div className="view-switch" role="group" aria-label="Вид каталога">
        <button
          type="button"
          className={`view-btn${view === 'grid' ? ' active' : ''}`}
          onClick={() => setView('grid')}
          aria-pressed={view === 'grid'}
          title="Сетка карточек"
        >
          <Icons.grid w={14} />
        </button>
        <button
          type="button"
          className={`view-btn${view === 'heat' ? ' active' : ''}`}
          onClick={() => setView('heat')}
          aria-pressed={view === 'heat'}
          title="Таблица-heatmap"
        >
          <Icons.layers w={14} />
        </button>
      </div>

      {/* filter-anchor — positioning context для popover'а. Кнопка и popover —
          siblings: popover отрисуется поверх через position:absolute. */}
      <div className="filter-anchor">
        <button
          ref={filterBtnRef}
          type="button"
          className="filter-btn"
          onClick={() => {
            if (filterOpen && filterAnchor === 'sortbar') setFilterOpen(false)
            else { setFilterAnchor('sortbar'); setFilterOpen(true) }
          }}
          aria-expanded={filterOpen && filterAnchor === 'sortbar'}
          aria-haspopup="dialog"
        >
          <Icons.sliders w={14} />
          Фильтры
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
        <FilterPanel anchor="sortbar" anchorRef={filterBtnRef} />
      </div>
    </div>
  )
}
