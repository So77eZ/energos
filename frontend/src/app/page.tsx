import { DrinkCatalog } from '@widgets/drink-catalog/ui/DrinkCatalog'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'

export default async function CatalogPage() {
  const [drinks, reviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])
  return <DrinkCatalog initialDrinks={drinks} allReviews={reviews} />
}
