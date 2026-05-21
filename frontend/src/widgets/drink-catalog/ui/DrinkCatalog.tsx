'use client'

import { useMemo, useState } from 'react'
import { DrinkCard, enrichDrinks } from '@entities/drink'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { FilterPanel } from '@features/filter-drinks/ui/FilterPanel'
import { SortBar } from '@features/filter-drinks/ui/SortBar'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'
import { StatsStrip } from '@widgets/stats-strip/ui/StatsStrip'

const PAGE_SIZE = 12

interface DrinkCatalogProps {
  initialDrinks: Drink[]
  allReviews: Review[]
}

export function DrinkCatalog({ initialDrinks, allReviews }: DrinkCatalogProps) {
  const enriched = useMemo(() => enrichDrinks(initialDrinks, allReviews), [initialDrinks, allReviews])
  const { filtered } = useFilterDrinks(enriched)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  if (initialDrinks.length === 0) {
    return (
      <div className="empty">
        <Icons.beaker />
        <p>Не удалось загрузить напитки. Проверьте подключение к API.</p>
      </div>
    )
  }

  return (
    <div className="page page-home">
      <StatsStrip drinks={enriched} />

      <SortBar />
      <FilterPanel />

      {filtered.length > 0 ? (
        <div className="grid grid-regular">
          {paginated.map((drink, i) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              rank={(safePage - 1) * PAGE_SIZE + i + 1}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Icons.flask />
          <p>Ничего не найдено — попробуйте изменить фильтры.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="pager-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Предыдущая страница"
          >
            <Icons.arrowL />
          </button>
          <span className="pager-text">
            <span className="pager-text-cur">{safePage}</span> / {totalPages}
          </span>
          <button
            type="button"
            className="pager-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Следующая страница"
          >
            <Icons.arrow />
          </button>
        </div>
      )}
    </div>
  )
}
