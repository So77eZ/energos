'use client'

import { Frown } from 'lucide-react'
import type { Drink } from '@entities/drink'
import { DrinkCard } from '@entities/drink'
import type { Review, ReviewMetrics } from '@entities/review'
import { calcRating, METRIC_KEYS } from '@entities/review'
import { FilterPanel } from '@features/filter-drinks/ui/FilterPanel'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'

interface DrinkCatalogProps {
  initialDrinks: Drink[]
  allReviews: Review[]
}

// RGB values matching the metric icon colors used in ReviewsPage
const METRIC_RGB: [number, number, number][] = [
  [0, 229, 255],   // acidity — cyan
  [0, 102, 204],   // sweetness — blue
  [255, 46, 136],  // carbonation — pink
  [192, 132, 252], // concentration — purple
  [251, 191, 36],  // aftertaste — amber
  [0, 255, 157],   // price_quality — green
]

function blendMetricColor(m: ReviewMetrics): string {
  let r = 0, g = 0, b = 0, w = 0
  METRIC_KEYS.forEach((key, i) => {
    const v = m[key]
    r += METRIC_RGB[i][0] * v
    g += METRIC_RGB[i][1] * v
    b += METRIC_RGB[i][2] * v
    w += v
  })
  return `${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)}`
}

function buildColorMap(drinks: Drink[], reviews: Review[]): Map<number, string | null> {
  const map = new Map<number, string | null>()
  for (const drink of drinks) {
    const dr = reviews.filter((r) => r.energy_drink_id === drink.id)
    if (dr.length === 0) { map.set(drink.id, null); continue }
    const source: ReviewMetrics = dr.find((r) => r.from_admin) ?? (() => {
      const avg = (key: keyof ReviewMetrics) => dr.reduce((s, r) => s + r[key], 0) / dr.length
      return { acidity: avg('acidity'), sweetness: avg('sweetness'), carbonation: avg('carbonation'), concentration: avg('concentration'), aftertaste: avg('aftertaste'), price_quality: avg('price_quality') }
    })()
    map.set(drink.id, blendMetricColor(source))
  }
  return map
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
  const colorMap = buildColorMap(initialDrinks, allReviews)

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
            <DrinkCard key={drink.id} drink={drink} index={i} rating={ratingMap.get(drink.id) ?? null} accentColor={colorMap.get(drink.id) ?? null} />
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
