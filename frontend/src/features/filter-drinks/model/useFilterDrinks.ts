import { useMemo } from 'react'
import type { EnrichedDrink } from '@entities/drink'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'

export type { SortOption }

export interface DrinkFilters {
  search: string
  sort: SortOption
  noSugarOnly: boolean
}

const RATING_FOR_SORT = (d: EnrichedDrink, asc: boolean) =>
  d.rating ?? (asc ? Infinity : -Infinity)

const PRICE_FOR_SORT = (d: EnrichedDrink, asc: boolean) =>
  d.price ?? (asc ? Infinity : -Infinity)

const CREATED_FOR_SORT = (d: EnrichedDrink) =>
  d.created_at ? Date.parse(d.created_at) : 0

export function useFilterDrinks(drinks: EnrichedDrink[]) {
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

    const arr = [...result]
    switch (sort) {
      case 'price_asc':
        arr.sort((a, b) => PRICE_FOR_SORT(a, true) - PRICE_FOR_SORT(b, true))
        break
      case 'price_desc':
        arr.sort((a, b) => PRICE_FOR_SORT(b, false) - PRICE_FOR_SORT(a, false))
        break
      case 'rating_desc':
        arr.sort((a, b) => RATING_FOR_SORT(b, false) - RATING_FOR_SORT(a, false))
        break
      case 'rating_asc':
        arr.sort((a, b) => RATING_FOR_SORT(a, true) - RATING_FOR_SORT(b, true))
        break
      case 'fresh_desc':
        arr.sort((a, b) => CREATED_FOR_SORT(b) - CREATED_FOR_SORT(a))
        break
      case 'fresh_asc':
        arr.sort((a, b) => CREATED_FOR_SORT(a) - CREATED_FOR_SORT(b))
        break
      case 'reviews_desc':
        arr.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'reviews_asc':
        arr.sort((a, b) => a.reviewCount - b.reviewCount)
        break
      default:
        arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }
    return arr
  }, [drinks, search, sort, noSugarOnly])

  return { filters, setFilter, filtered }
}
