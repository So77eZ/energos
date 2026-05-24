import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { authApi } from '@entities/user'
import { getToken } from '@shared/lib/session'
import { DrinkCatalog } from '@widgets/drink-catalog/ui/DrinkCatalog'

export default async function CatalogPage() {
  const token = await getToken()
  const [drinks, reviews, user] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
    token ? authApi.me(token).catch(() => null) : Promise.resolve(null),
  ])
  return <DrinkCatalog initialDrinks={drinks} allReviews={reviews} currentUserId={user?.id ?? null} />
}
