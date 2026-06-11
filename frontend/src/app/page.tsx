import { Suspense } from 'react'
import { drinkApi, enrichDrinks, pickHero } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { DrinkCatalog } from '@widgets/drink-catalog/ui/DrinkCatalog'
import { StatsStrip } from '@widgets/stats-strip/ui/StatsStrip'
import { HomeHero } from '@widgets/home-hero/ui/HomeHero'
import { HomeSideRail } from '@widgets/home-side-rail/ui/HomeSideRail'
import { ThreeCansLazy } from '@widgets/three-cans/ui/ThreeCansLazy'
import { HiddenBolt } from '@features/easter-eggs'

export default async function CatalogPage() {
  const [drinks, reviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])
  // Обогащаем один раз на сервере (раньше считалось в useMemo в DrinkCatalog из
  // тех же данных — поведение идентично). Композиция home-секций — на page-слое,
  // чтобы виджеты не импортили друг друга (FSD: widget→widget убран).
  const enriched = enrichDrinks(drinks, reviews)
  const hero = pickHero(enriched)
  const hasDrinks = enriched.length > 0

  return (
    <div className="page page-home">
      <HiddenBolt id="catalog" />
      {hasDrinks && <ThreeCansLazy />}
      {hasDrinks && <StatsStrip drinks={enriched} />}
      {hero && <HomeHero drink={hero} rank={1} />}
      {/* Suspense — обязателен для useSearchParams (?page=) внутри DrinkCatalog. */}
      <Suspense>
        <DrinkCatalog
          enriched={enriched}
          heroId={hero?.id ?? null}
          sideRail={hasDrinks ? <HomeSideRail drinks={enriched} /> : null}
        />
      </Suspense>
    </div>
  )
}
