'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { DrinkCard } from '@entities/drink'
import type { EnrichedDrink, Tier } from '@entities/drink'
import { useCatalogSearch, type SortOption } from '@shared/lib/catalog-search'
import { useFavorites } from '@features/favorites'
import { Icons } from '@shared/ui/icons'
import { SortBar } from '@features/filter-drinks/ui/SortBar'
import { useFilterDrinks } from '@features/filter-drinks/model/useFilterDrinks'
import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion'
import { useInfiniteReveal } from '../model/useInfiniteReveal'
import { HeatmapView } from './HeatmapView'

const PAGE_SIZE = 12

const SORT_OPTIONS: readonly SortOption[] = [
  'name', 'price_asc', 'price_desc', 'rating_desc', 'rating_asc',
  'fresh_desc', 'fresh_asc', 'reviews_desc', 'reviews_asc',
]
const TIERS: readonly Tier[] = ['S', 'A', 'B', 'C', 'D']

interface DrinkCatalogProps {
  /** Обогащённый каталог считает page.tsx (server) — виджет получает готовым. */
  enriched: EnrichedDrink[]
  /** Hero исключается из грида (рендерится отдельно на page-уровне). */
  heroId: number | null
  /** Боковая колонка (HomeSideRail) — слот от page, чтобы не было widget→widget. */
  sideRail: ReactNode
}

export function DrinkCatalog({ enriched, heroId, sideRail }: DrinkCatalogProps) {
  const { filtered } = useFilterDrinks(enriched)
  const { toggle, isFavorite } = useFavorites()
  const {
    search,
    view, setView,
    sort, setSort,
    tiers, setTiers,
    priceRange, setPriceRange,
    onlyNew, setOnlyNew,
    noSugarOnly, setNoSugarOnly,
    setSearchItems,
    setPriceBounds,
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
    if (sort !== 'name') params.set('sort', sort)
    if (tiers.length) params.set('tiers', tiers.join(','))
    if (priceRange) params.set('price', `${priceRange[0]}-${priceRange[1]}`)
    if (onlyNew) params.set('new', '1')
    if (noSugarOnly) params.set('zero', '1')
    if (view !== 'grid') params.set('view', view)
    const qs = params.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, tiers, priceRange, onlyNew, noSugarOnly, view])

  // [min, max] цен — границы для слайдера в filter-popover'е. Игнорируем напитки
  // без цены; если их вообще нет — fallback [0, 500] чтобы слайдер не сломался.
  const priceBounds = useMemo<[number, number]>(() => {
    const prices = enriched.map((d) => d.price).filter((p): p is number => p != null)
    if (prices.length === 0) return [0, 500]
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [enriched])

  // Кладём границы цен в контекст — их читает FilterPanel (в т.ч. header-popover,
  // который рендерится вне этого виджета).
  useEffect(() => { setPriceBounds(priceBounds) }, [priceBounds, setPriceBounds])

  // Exclude hero drink from the grid to avoid duplication on the default view.
  const gridSource = useMemo(
    () => (heroId != null ? filtered.filter((d) => d.id !== heroId) : filtered),
    [filtered, heroId],
  )

  const resetKey = JSON.stringify({ search, sort, tiers, priceRange, onlyNew, noSugarOnly })
  const { count, sentinelRef, showMore, hasMore } = useInfiniteReveal({
    total: gridSource.length,
    chunk: PAGE_SIZE,
    resetKey,
  })
  const visible = gridSource.slice(0, count)

  // Скролл к каталогу при вводе поиска (раз на переход пусто↔непусто).
  const sortRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const prevHad = useRef<boolean | null>(null)
  useEffect(() => {
    const has = search.trim().length > 0
    if (prevHad.current === null) { prevHad.current = has; return } // mount — без скролла
    if (has === prevHad.current) return
    prevHad.current = has
    const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'
    if (has) sortRef.current?.scrollIntoView({ behavior, block: 'start' })
    else window.scrollTo({ top: 0, behavior })
  }, [search, reducedMotion])

  if (enriched.length === 0) {
    return (
      <div className="empty">
        <Icons.beaker />
        <p>Не удалось загрузить напитки. Проверьте подключение к API.</p>
      </div>
    )
  }

  return (
    <>
      <div ref={sortRef} className="cat-anchor">
        <SortBar />
      </div>

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
                {visible.map((drink, i) => (
                  <DrinkCard
                    key={drink.id}
                    drink={drink}
                    rank={i + (heroId != null ? 2 : 1)}
                    isFav={isFavorite(drink.id)}
                    onToggleFav={() => toggle(drink.id, drink.name)}
                  />
                ))}
              </div>

              <p className="sr-only" aria-live="polite" role="status">
                Показано {visible.length} из {gridSource.length}
              </p>

              {hasMore && (
                <>
                  <div ref={sentinelRef} className="cat-sentinel" aria-hidden="true" />
                  <div className="cat-more-row">
                    <button type="button" className="cta-ghost cat-more" onClick={showMore}>
                      Показать ещё
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {sideRail}
      </div>
    </>
  )
}
