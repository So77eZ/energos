import { drinkApi, enrichDrinks } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { TierPage } from '@widgets/tier-page/ui/TierPage'

export const metadata = { title: 'Tier list — Energos' }
export const dynamic = 'force-dynamic'

export default async function TierRoute() {
  const [drinks, allReviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  const enriched = enrichDrinks(drinks, allReviews)
  return <TierPage drinks={enriched} />
}
