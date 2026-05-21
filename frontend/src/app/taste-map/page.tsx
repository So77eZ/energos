import { drinkApi, enrichDrinks } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { TasteMapChart } from '@widgets/taste-map/ui/TasteMapChart'

export const metadata = { title: 'Карта вкусов — Energos' }

export default async function TasteMapPage() {
  const [drinks, allReviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  // Enriching server-side keeps the client component lighter — it just renders.
  const enriched = enrichDrinks(drinks, allReviews)

  return <TasteMapChart drinks={enriched} />
}
