import { drinkApi, enrichDrinks } from '@entities/drink'
import { TasteMapChart } from '@widgets/taste-map/ui/TasteMapChart'

export const metadata = { title: 'Карта вкусов — Energos' }

export default async function TasteMapPage() {
  const drinks = await drinkApi.list().catch(() => [])

  // Enriching server-side keeps the client component lighter — it just renders.
  const enriched = enrichDrinks(drinks)

  return <TasteMapChart drinks={enriched} />
}
