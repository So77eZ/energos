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
/** Какой триггер открыл фильтр-popover — определяет, под какой кнопкой он
 *  рендерится: 'sortbar' (в потоке каталога) или 'header' (под sticky-шапкой). */
export type FilterAnchor = 'sortbar' | 'header'

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
  /** Под какой кнопкой показать popover (sortbar vs header). */
  filterAnchor: FilterAnchor
  setFilterAnchor: (v: FilterAnchor) => void
  view: CatalogView
  setView: (v: CatalogView) => void
  searchItems: SearchItem[]
  setSearchItems: (items: SearchItem[]) => void
  /** [min, max] цен каталога для слайдера в FilterPanel. Каталог кладёт сюда
   *  реальные границы; дефолт [0, 500]. В контексте — чтобы header-popover
   *  (вне DrinkCatalog) тоже имел доступ. */
  priceBounds: [number, number]
  setPriceBounds: (v: [number, number]) => void
}

const Ctx = createContext<PageSearchCtx>({
  search: '', setSearch: () => {},
  sort: 'name', setSort: () => {},
  tiers: [], setTiers: () => {},
  priceRange: null, setPriceRange: () => {},
  onlyNew: false, setOnlyNew: () => {},
  noSugarOnly: false, setNoSugarOnly: () => {},
  filterOpen: false, setFilterOpen: () => {},
  filterAnchor: 'sortbar', setFilterAnchor: () => {},
  view: 'grid', setView: () => {},
  searchItems: [], setSearchItems: () => {},
  priceBounds: [0, 500], setPriceBounds: () => {},
})

function SearchResetter() {
  const pathname = usePathname()
  const {
    setSearch, setSearchItems, setFilterOpen,
    setSort, setTiers, setPriceRange, setOnlyNew, setNoSugarOnly,
  } = useContext(Ctx)
  // На уходе со страницы чистим поиск и фильтры (свежий каталог при возврате),
  // но НЕ view: grid/heat — display-преференс, а не фильтр, и должен переживать
  // навигацию (как тема/шрифт).
  useEffect(() => {
    setSearch('')
    setSearchItems([])
    setFilterOpen(false)
    setSort('name')
    setTiers([])
    setPriceRange(null)
    setOnlyNew(false)
    setNoSugarOnly(false)
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
  const [filterAnchor, setFilterAnchor] = useState<FilterAnchor>('sortbar')
  const [view, setView] = useState<CatalogView>('grid')
  const [searchItems, setSearchItems] = useState<SearchItem[]>([])
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 500])

  return (
    <Ctx.Provider value={{
      search, setSearch,
      sort, setSort,
      tiers, setTiers,
      priceRange, setPriceRange,
      onlyNew, setOnlyNew,
      noSugarOnly, setNoSugarOnly,
      filterOpen, setFilterOpen,
      filterAnchor, setFilterAnchor,
      view, setView,
      searchItems, setSearchItems,
      priceBounds, setPriceBounds,
    }}>
      <SearchResetter />
      {children}
    </Ctx.Provider>
  )
}

export const useCatalogSearch = () => useContext(Ctx)
