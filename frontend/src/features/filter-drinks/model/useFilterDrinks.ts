import { useMemo } from 'react'
import type { EnrichedDrink } from '@entities/drink'
import { METRIC_KEYS } from '@entities/review'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'
import { searchByName } from '@shared/lib/name-search'
import { countTasteFilters, isActiveTasteRange } from './taste-filters'

export type { SortOption }

const RATING_FOR_SORT = (d: EnrichedDrink, asc: boolean) =>
  d.rating ?? (asc ? Infinity : -Infinity)

const PRICE_FOR_SORT = (d: EnrichedDrink, asc: boolean) =>
  d.price ?? (asc ? Infinity : -Infinity)

const CREATED_FOR_SORT = (d: EnrichedDrink) =>
  d.created_at ? Date.parse(d.created_at) : 0

type DrinkFilters = Pick<ReturnType<typeof useCatalogSearch>,
  'search' | 'sort' | 'tiers' | 'priceRange' | 'onlyNew' | 'noSugarOnly' | 'tasteFilters'>

export function hasActiveDrinkFilters({ search, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters }: DrinkFilters): boolean {
  return search.trim().length > 0 || tiers.length > 0 || priceRange != null ||
    onlyNew || noSugarOnly || countTasteFilters(tasteFilters) > 0
}

export function filterDrinks(drinks: EnrichedDrink[], {
  search, sort, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters,
}: DrinkFilters): EnrichedDrink[] {
  // Слова в любом порядке, с опечатками: «burm киви» находит «BURN Яблоко, киви».
  let result = searchByName(drinks, search)
  if (tiers.length > 0) {
    result = result.filter((d) => d.tier != null && tiers.includes(d.tier))
  }
  if (priceRange) {
    const [lo, hi] = priceRange
    result = result.filter((d) => d.price != null && d.price >= lo && d.price <= hi)
  }
  if (onlyNew) result = result.filter((d) => d.isNew)
  if (noSugarOnly) result = result.filter((d) => d.no_sugar)
  for (const key of METRIC_KEYS) {
    const range = tasteFilters[key]
    if (!isActiveTasteRange(range)) continue
    result = result.filter((d) => d.metrics != null &&
      Number.isFinite(d.metrics[key]) && d.metrics[key] >= range[0] && d.metrics[key] <= range[1])
  }

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
}

export function useFilterDrinks(drinks: EnrichedDrink[]) {
  const { search, sort, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters } = useCatalogSearch()
  const filtered = useMemo(() => filterDrinks(drinks, {
    search, sort, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters,
  }), [drinks, search, sort, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters])

  return { filtered, hasFilters: hasActiveDrinkFilters({ search, sort, tiers, priceRange, onlyNew, noSugarOnly, tasteFilters }) }
}
