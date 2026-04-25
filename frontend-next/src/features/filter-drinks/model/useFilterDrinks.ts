import { useMemo } from 'react'
import type { Drink } from '@entities/drink'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'

export type { SortOption }

export interface DrinkFilters {
  search: string
  sort: SortOption
  noSugarOnly: boolean
}

export function useFilterDrinks(drinks: Drink[]) {
  const { search, sort, noSugarOnly, setSort, setNoSugarOnly } = useCatalogSearch()
  const filters: DrinkFilters = { search, sort, noSugarOnly }

  function setFilter<K extends keyof DrinkFilters>(key: K, value: DrinkFilters[K]) {
    if (key === 'sort') setSort(value as SortOption)
    if (key === 'noSugarOnly') setNoSugarOnly(value as boolean)
  }

  const filtered = useMemo(() => {
    let result = drinks
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.name.toLowerCase().includes(q))
    }
    if (noSugarOnly) result = result.filter((d) => d.no_sugar)
    if (sort === 'price') {
      result = [...result].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }
    return result
  }, [drinks, search, sort, noSugarOnly])

  return { filters, setFilter, filtered }
}
