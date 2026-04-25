'use client'

import { Frown } from 'lucide-react'
import type { Drink } from '@entities/drink'
import { DrinkCard } from '@entities/drink'
import type { Review } from '@entities/review'
import { calcRating } from '@entities/review'
import { FilterPanel } from '@features/filter-drinks/ui/FilterPanel'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'

interface DrinkCatalogProps {
  initialDrinks: Drink[]
  allReviews: Review[]
}

function buildRatingMap(drinks: Drink[], reviews: Review[]): Map<number, number | null> {
  const map = new Map<number, number | null>()
  for (const drink of drinks) {
    const dr = reviews.filter((r) => r.energy_drink_id === drink.id)
    if (dr.length === 0) { map.set(drink.id, null); continue }
    const admin = dr.find((r) => r.from_admin)
    if (admin) {
      map.set(drink.id, calcRating(admin))
    } else {
      const avg = dr.reduce((s, r) => s + calcRating(r), 0) / dr.length
      map.set(drink.id, Math.round(avg * 10) / 10)
    }
  }
  return map
}

export function DrinkCatalog({ initialDrinks, allReviews }: DrinkCatalogProps) {
  const { filtered } = useFilterDrinks(initialDrinks)
  const ratingMap = buildRatingMap(initialDrinks, allReviews)

  if (initialDrinks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-[#9090a8]">
        <Frown className="w-12 h-12 opacity-40" />
        <p>Не удалось загрузить напитки. Проверьте подключение к API.</p>
      </div>
    )
  }

  return (
    <div>
      <FilterPanel />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[5px] sm:gap-4">
          {filtered.map((drink, i) => (
            <DrinkCard key={drink.id} drink={drink} index={i} rating={ratingMap.get(drink.id) ?? null} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-[#9090a8]">
          <Frown className="w-10 h-10 opacity-40" />
          <p className="text-sm">Ничего не найдено — попробуйте изменить фильтры.</p>
        </div>
      )}
    </div>
  )
}
