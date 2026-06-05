'use client'

import dynamic from 'next/dynamic'
import { HiddenBolt } from '@shared/ui/HiddenBolt'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DrinkCard, enrichDrinks } from '@entities/drink'
import type { Drink, EnrichedDrink, Tier } from '@entities/drink'
import type { Review } from '@entities/review'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'
import { Icons } from '@shared/ui/icons'
import { SortBar } from '@features/filter-drinks/ui/SortBar'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'
import { StatsStrip } from '@widgets/stats-strip/ui/StatsStrip'
import { HomeHero } from '@widgets/home-hero/ui/HomeHero'
import { HomeSideRail } from '@widgets/home-side-rail/ui/HomeSideRail'
import { HeatmapView } from './HeatmapView'

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

const SORT_OPTIONS: readonly SortOption[] = [
  'name', 'price_asc', 'price_desc', 'rating_desc', 'rating_asc',
  'fresh_desc', 'fresh_asc', 'reviews_desc', 'reviews_asc',
]
const TIERS: readonly Tier[] = ['S', 'A', 'B', 'C', 'D']

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
  const {
    view, setView,
    sort, setSort,
    tiers, setTiers,
    priceRange, setPriceRange,
    onlyNew, setOnlyNew,
    noSugarOnly, setNoSugarOnly,
    setSearchItems,
  } = useCatalogSearch()

  // Источник для live-результатов поиска (мобильный оверлей + /drinks dropdown).
  useEffect(() => {
    setSearchItems(enriched.map((d) => ({ id: d.id, name: d.name, image_url: d.image_url })))
  }, [enriched, setSearchItems])

  // Состояние каталога (page + sort + фильтры + view) живёт в URL — переживает
  // back-навигацию и шарится. State — источник для рендера, URL — зеркало.
  // `search` НЕ синкается намеренно: его сбрасывает SearchResetter при навигации.
  const router = useRouter()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)

  // Гидратация состояния из URL — один раз при маунте (back-навигация на /?...).
  useEffect(() => {
    const sp = searchParams
    const s = sp.get('sort')
    if (s && (SORT_OPTIONS as readonly string[]).includes(s)) setSort(s as SortOption)
    const t = sp.get('tiers')
    if (t) {
      const parsed = t.split(',').filter((x): x is Tier => (TIERS as readonly string[]).includes(x))
      if (parsed.length) setTiers(parsed)
    }
    const pr = sp.get('price')
    if (pr) {
      const [lo, hi] = pr.split('-').map(Number)
      if (Number.isFinite(lo) && Number.isFinite(hi)) setPriceRange([lo, hi])
    }
    if (sp.get('new') === '1') setOnlyNew(true)
    if (sp.get('zero') === '1') setNoSugarOnly(true)
    const v = sp.get('view')
    if (v === 'heat' || v === 'grid') setView(v)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Зеркалим state → URL при изменениях. Первый прогон (маунт) пропускаем,
  // чтобы не затереть параметры URL дефолтами до гидратации.
  const firstWrite = useRef(true)
  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false
      return
    }
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (sort !== 'name') params.set('sort', sort)
    if (tiers.length) params.set('tiers', tiers.join(','))
    if (priceRange) params.set('price', `${priceRange[0]}-${priceRange[1]}`)
    if (onlyNew) params.set('new', '1')
    if (noSugarOnly) params.set('zero', '1')
    if (view !== 'grid') params.set('view', view)
    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, tiers, priceRange, onlyNew, noSugarOnly, view])

  // [min, max] цен — границы для слайдера в filter-popover'е. Игнорируем напитки
  // без цены; если их вообще нет — fallback [0, 500] чтобы слайдер не сломался.
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = enriched.map((d) => d.price).filter((p): p is number => p != null)
    if (prices.length === 0) return [0, 500]
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [enriched])

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
      <HiddenBolt id="catalog" />
      <ThreeCans />
      <StatsStrip drinks={enriched} />
      {hero && <HomeHero drink={hero} rank={1} />}

      <SortBar priceBounds={priceBounds} />

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
          {gridSource.length === 0 ? (
            <div className="empty">
              <Icons.flask />
              <p>Ничего не найдено — попробуйте изменить фильтры.</p>
            </div>
          ) : view === 'heat' ? (
            // Heatmap-режим: вся отсортированная выборка целиком (без hero-исключения
            // и без пагинации — таблица сама по себе компактнее и легче скроллится).
            <HeatmapView drinks={filtered} />
          ) : (
            <>
              <div className="grid grid-regular">
                {paginated.map((drink, i) => (
                  <DrinkCard
                    key={drink.id}
                    drink={drink}
                    rank={(safePage - 1) * PAGE_SIZE + i + (hero ? 2 : 1)}
                  />
                ))}
              </div>

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
            </>
          )}
        </div>

        <HomeSideRail drinks={enriched} />
      </div>
    </div>
  )
}
