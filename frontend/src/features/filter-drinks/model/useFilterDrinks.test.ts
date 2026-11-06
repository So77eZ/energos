import { describe, expect, it } from 'vitest'
import type { Drink, EnrichedDrink } from '@entities/drink'
import { enrichDrink } from '@entities/drink/lib/enrich'
import { filterDrinks, hasActiveDrinkFilters } from './useFilterDrinks'

const metrics = { acidity: 3, sweetness: 3, carbonation: 3, concentration: 3, aftertaste: 3, price_quality: 3 }

function drink(id: number, patch: Partial<EnrichedDrink> = {}): EnrichedDrink {
  const source: Drink = {
    id, name: `Drink ${id}`, price: 100, image_url: null, no_sugar: true,
    created_at: null, updated_at: null,
    stats: { rating: 4, reviewsCount: 2, metrics },
  }
  return { ...enrichDrink(source), isNew: true, ...patch }
}

const defaults = {
  search: '', sort: 'name' as const, tiers: [], priceRange: null,
  onlyNew: false, noSugarOnly: false, tasteFilters: {},
}

describe('filterDrinks taste ranges', () => {
  it('combines inclusive taste ranges and compares fractional averages without rounding', () => {
    const drinks = [
      drink(1, { metrics: { ...metrics, sweetness: 2, acidity: 3.5 } }),
      drink(2, { metrics: { ...metrics, sweetness: 3, acidity: 4 } }),
      drink(3, { metrics: { ...metrics, sweetness: 3.1, acidity: 3 } }),
      drink(4, { metrics: { ...metrics, sweetness: 1.9, acidity: 3 } }),
      drink(5, { metrics: { ...metrics, sweetness: 2.5, acidity: 4.1 } }),
      drink(6, { metrics: null, rating: null, tier: null }),
    ]
    const filtered = filterDrinks(drinks, { ...defaults, tasteFilters: { sweetness: [2, 3], acidity: [3, 4] } })

    expect(filtered.map((d) => d.id)).toEqual([1, 2])
  })

  it('keeps unrated drinks when no taste range is active, including the full range', () => {
    const drinks = [drink(1), drink(2, { metrics: null, rating: null, tier: null })]

    expect(filterDrinks(drinks, defaults).map((d) => d.id)).toEqual([1, 2])
    expect(filterDrinks(drinks, { ...defaults, tasteFilters: { sweetness: [1, 5] } }).map((d) => d.id)).toEqual([1, 2])
  })

  it('combines taste with search, tier, price, new and sugar filters, preserving sorting', () => {
    const drinks = [
      drink(1, { name: 'BURN Kiwi', price: 110 }),
      drink(2, { name: 'BURN Kiwi Zero', price: 120 }),
      drink(3, { name: 'Other' }),
      drink(4, { name: 'BURN Kiwi', tier: 'D' }),
      drink(5, { name: 'BURN Kiwi', price: 200 }),
      drink(6, { name: 'BURN Kiwi', isNew: false }),
      drink(7, { name: 'BURN Kiwi', no_sugar: false }),
      drink(8, { name: 'BURN Kiwi', metrics: { ...metrics, sweetness: 5 } }),
    ]
    const filtered = filterDrinks(drinks, {
      ...defaults, search: 'burn kiwi', sort: 'price_desc', tiers: ['A'], priceRange: [100, 120],
      onlyNew: true, noSugarOnly: true, tasteFilters: { sweetness: [2, 4] },
    })

    expect(filtered.map((d) => d.id)).toEqual([2, 1])
    expect(drinks.map((d) => d.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('rejects non-finite metric averages when the metric is filtered', () => {
    const drinks = [drink(1), drink(2, { metrics: { ...metrics, sweetness: NaN } })]

    expect(filterDrinks(drinks, { ...defaults, tasteFilters: { sweetness: [2, 4] } }).map((d) => d.id)).toEqual([1])
  })
})

describe('catalog filter activity', () => {
  it('keeps the default hero exclusion for whitespace search, full taste ranges and sorting alone', () => {
    expect(hasActiveDrinkFilters(defaults)).toBe(false)
    expect(hasActiveDrinkFilters({ ...defaults, search: '  ', sort: 'rating_desc', tasteFilters: { sweetness: [1, 5] } })).toBe(false)
  })

  it('includes the hero in results for each actual filter criterion', () => {
    expect(hasActiveDrinkFilters({ ...defaults, search: 'BURN' })).toBe(true)
    expect(hasActiveDrinkFilters({ ...defaults, tiers: ['A'] })).toBe(true)
    expect(hasActiveDrinkFilters({ ...defaults, priceRange: [100, 120] })).toBe(true)
    expect(hasActiveDrinkFilters({ ...defaults, onlyNew: true })).toBe(true)
    expect(hasActiveDrinkFilters({ ...defaults, noSugarOnly: true })).toBe(true)
    expect(hasActiveDrinkFilters({ ...defaults, tasteFilters: { sweetness: [2, 4] } })).toBe(true)
  })
})
