'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import type { Tier } from '@entities/drink'

export type SortOption =
  | 'name'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'rating_asc'
  | 'fresh_desc'
  | 'fresh_asc'
  | 'reviews_desc'
  | 'reviews_asc'
export type CatalogView = 'grid' | 'heat'
export type SearchItem = { id: number; name: string; image_url?: string | null }

/** Диапазон цены [min, max]. null = ограничения нет. Юзер задаёт через
 *  слайдер в фильтр-popover'е; null когда обе ручки на границах данных. */
export type PriceRange = [number, number] | null

interface PageSearchCtx {
  search: string
  setSearch: (v: string) => void
  sort: SortOption
  setSort: (v: SortOption) => void
  /** Множество выбранных тиров. Пустой массив = тиры не фильтруются. */
  tiers: Tier[]
  setTiers: (v: Tier[]) => void
  priceRange: PriceRange
  setPriceRange: (v: PriceRange) => void
  /** "Только новые" — фильтрует по EnrichedDrink.isNew (computed). */
  onlyNew: boolean
  setOnlyNew: (v: boolean) => void
  noSugarOnly: boolean
  setNoSugarOnly: (v: boolean) => void
  filterOpen: boolean
  setFilterOpen: (v: boolean) => void
  view: CatalogView
  setView: (v: CatalogView) => void
  searchItems: SearchItem[]
  setSearchItems: (items: SearchItem[]) => void
}

const Ctx = createContext<PageSearchCtx>({
  search: '', setSearch: () => {},
  sort: 'name', setSort: () => {},
  tiers: [], setTiers: () => {},
  priceRange: null, setPriceRange: () => {},
  onlyNew: false, setOnlyNew: () => {},
  noSugarOnly: false, setNoSugarOnly: () => {},
  filterOpen: false, setFilterOpen: () => {},
  view: 'grid', setView: () => {},
  searchItems: [], setSearchItems: () => {},
})

function SearchResetter() {
  const pathname = usePathname()
  const {
    setSearch, setSearchItems, setFilterOpen,
    setSort, setTiers, setPriceRange, setOnlyNew, setNoSugarOnly, setView,
  } = useContext(Ctx)
  useEffect(() => {
    setSearch('')
    setSearchItems([])
    setFilterOpen(false)
    setSort('name')
    setTiers([])
    setPriceRange(null)
    setOnlyNew(false)
    setNoSugarOnly(false)
    setView('grid')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

export function CatalogSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name')
  const [tiers, setTiers] = useState<Tier[]>([])
  const [priceRange, setPriceRange] = useState<PriceRange>(null)
  const [onlyNew, setOnlyNew] = useState(false)
  const [noSugarOnly, setNoSugarOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [view, setView] = useState<CatalogView>('grid')
  const [searchItems, setSearchItems] = useState<SearchItem[]>([])

  return (
    <Ctx.Provider value={{
      search, setSearch,
      sort, setSort,
      tiers, setTiers,
      priceRange, setPriceRange,
      onlyNew, setOnlyNew,
      noSugarOnly, setNoSugarOnly,
      filterOpen, setFilterOpen,
      view, setView,
      searchItems, setSearchItems,
    }}>
      <SearchResetter />
      {children}
    </Ctx.Provider>
  )
}

export const useCatalogSearch = () => useContext(Ctx)
