'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export type SortOption = 'name' | 'price'
export type SearchItem = { id: number; name: string; image_url?: string | null }

interface PageSearchCtx {
  search: string
  setSearch: (v: string) => void
  sort: SortOption
  setSort: (v: SortOption) => void
  noSugarOnly: boolean
  setNoSugarOnly: (v: boolean) => void
  filterOpen: boolean
  setFilterOpen: (v: boolean) => void
  searchItems: SearchItem[]
  setSearchItems: (items: SearchItem[]) => void
}

const Ctx = createContext<PageSearchCtx>({
  search: '', setSearch: () => {},
  sort: 'name', setSort: () => {},
  noSugarOnly: false, setNoSugarOnly: () => {},
  filterOpen: false, setFilterOpen: () => {},
  searchItems: [], setSearchItems: () => {},
})

function SearchResetter() {
  const pathname = usePathname()
  const { setSearch, setSearchItems, setFilterOpen } = useContext(Ctx)
  useEffect(() => {
    setSearch('')
    setSearchItems([])
    setFilterOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

export function CatalogSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name')
  const [noSugarOnly, setNoSugarOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchItems, setSearchItems] = useState<SearchItem[]>([])

  return (
    <Ctx.Provider value={{ search, setSearch, sort, setSort, noSugarOnly, setNoSugarOnly, filterOpen, setFilterOpen, searchItems, setSearchItems }}>
      <SearchResetter />
      {children}
    </Ctx.Provider>
  )
}

export const useCatalogSearch = () => useContext(Ctx)
