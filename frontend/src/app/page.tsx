import { Suspense } from 'react'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { DrinkCatalog } from '@widgets/drink-catalog/ui/DrinkCatalog'

export default async function CatalogPage() {
  const [drinks, reviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])
  // Suspense — обязателен для useSearchParams (?page=) внутри клиентского DrinkCatalog.
  return (
    <Suspense>
      <DrinkCatalog initialDrinks={drinks} allReviews={reviews} />
    </Suspense>
  )
}
