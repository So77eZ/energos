import { drinkApi, enrichDrinks } from '@entities/drink'
import { TierPage } from '@widgets/tier-page/ui/TierPage'

export const metadata = { title: 'Tier list — Energos' }
export const dynamic = 'force-dynamic'

export default async function TierRoute() {
  const drinks = await drinkApi.list().catch(() => [])

  const enriched = enrichDrinks(drinks)
  return <TierPage drinks={enriched} />
}
