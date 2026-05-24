import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { DrinkCatalog } from '@widgets/drink-catalog/ui/DrinkCatalog'

export default async function CatalogPage() {
  const [drinks, reviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])
  return <DrinkCatalog initialDrinks={drinks} allReviews={reviews} />
}
