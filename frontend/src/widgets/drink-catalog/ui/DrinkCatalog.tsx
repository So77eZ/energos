'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { DrinkCard, enrichDrinks } from '@entities/drink'
import type { Drink, EnrichedDrink } from '@entities/drink'
import type { Review } from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { FilterPanel } from '@features/filter-drinks/ui/FilterPanel'
import { SortBar } from '@features/filter-drinks/ui/SortBar'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'
import { StatsStrip } from '@widgets/stats-strip/ui/StatsStrip'
import { HomeHero } from '@widgets/home-hero/ui/HomeHero'
import { HomeSideRail } from '@widgets/home-side-rail/ui/HomeSideRail'

// Three.js is ~150 KB gzipped — load only on the client and only when the
// catalog actually mounts. The component renders nothing below 1440px (CSS
// `.three-bg` is `display: none`), so the bundle is wasted on small screens.
// If that bothers us later, gate the dynamic import on a `window.matchMedia`
// check; for now the JS cost is the only penalty.
const ThreeCans = dynamic(() => import('@widgets/three-cans/ui/ThreeCans').then((m) => m.ThreeCans), {
  ssr: false,
  loading: () => null,
})

const PAGE_SIZE = 12

interface DrinkCatalogProps {
  initialDrinks: Drink[]
  allReviews: Review[]
}

/** Hero shows the highest-rated drink with at least one review. */
function pickHero(drinks: EnrichedDrink[]): EnrichedDrink | null {
  const candidates = drinks.filter((d) => d.rating != null && d.reviewCount > 0)
  if (candidates.length === 0) return null
  return candidates.reduce((best, d) => (d.rating! > best.rating! ? d : best))
}

export function DrinkCatalog({ initialDrinks, allReviews }: DrinkCatalogProps) {
  const enriched = useMemo(() => enrichDrinks(initialDrinks, allReviews), [initialDrinks, allReviews])
  const hero = useMemo(() => pickHero(enriched), [enriched])
  const { filtered } = useFilterDrinks(enriched)
  const [page, setPage] = useState(1)

  // Exclude hero drink from the grid to avoid duplication on the default view.
  // When the user actively filters/sorts, the hero pin stays — the grid still
  // hides it, but if the filter excludes the hero, the grid is unaffected.
  const gridSource = useMemo(
    () => (hero ? filtered.filter((d) => d.id !== hero.id) : filtered),
    [filtered, hero],
  )

  const totalPages = Math.max(1, Math.ceil(gridSource.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = gridSource.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

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
      <ThreeCans />
      <StatsStrip drinks={enriched} />
      {hero && <HomeHero drink={hero} rank={1} />}

      <SortBar />
      <FilterPanel />

      {/* Inline CTA: предложить напиток */}
      <Link href="/submit" className="catalog-cta">
        <div className="catalog-cta-meta">
          <div className="catalog-cta-icon"><Icons.plus w={16} /></div>
          <div>
            <div className="catalog-cta-title">Не нашёл напиток?</div>
            <div className="catalog-cta-sub">Расскажи о нём — администратор добавит в каталог.</div>
          </div>
        </div>
        <span className="cta-ghost catalog-cta-btn">
          <Icons.plus w={12} /> Предложить
        </span>
      </Link>

      <div className="home-split with-rail">
        <div className="home-content">
          {gridSource.length > 0 ? (
            <div className="grid grid-regular">
              {paginated.map((drink, i) => (
                <DrinkCard
                  key={drink.id}
                  drink={drink}
                  rank={(safePage - 1) * PAGE_SIZE + i + (hero ? 2 : 1)}
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

        <HomeSideRail drinks={enriched} />
      </div>
    </div>
  )
}
