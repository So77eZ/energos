'use client'

import { Icons } from '@shared/ui/icons'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'

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
  const { sort, setSort, noSugarOnly, setNoSugarOnly, filterOpen, setFilterOpen } = useCatalogSearch()
  const { key: activeKey, dir: activeDir } = parseSort(sort)
  const isAll = sort === 'name' && !noSugarOnly
  const activeFilterCount = (noSugarOnly ? 1 : 0)

  function pickTab(tab: SortTab) {
    if (activeKey === tab.key) {
      // Same tab clicked again — flip direction.
      const nextDir: Direction = activeDir === 'desc' ? 'asc' : 'desc'
      setSort(combine(tab.key, nextDir))
    } else {
      setSort(combine(tab.key, tab.defaultDir))
    }
  }

  function toggleNoSugar() {
    setNoSugarOnly(!noSugarOnly)
  }

  function resetAll() {
    setSort('name')
    setNoSugarOnly(false)
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
          aria-selected={noSugarOnly}
          className={`sort-tab${noSugarOnly ? ' active' : ''}`}
          onClick={toggleNoSugar}
        >
          <span className="sort-tab-lbl">Без сахара</span>
          <span className="sort-tab-hint">zero sugar</span>
        </button>
        <button
          type="button"
          aria-selected={isAll}
          className={`sort-tab${isAll ? ' active' : ''}`}
          onClick={resetAll}
        >
          <span className="sort-tab-lbl">Все</span>
          <span className="sort-tab-hint">по названию</span>
        </button>
      </div>

      <button
        type="button"
        className="filter-btn"
        onClick={() => setFilterOpen(!filterOpen)}
        aria-expanded={filterOpen}
      >
        <Icons.sliders w={14} />
        Фильтры
        {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
      </button>
    </div>
  )
}
