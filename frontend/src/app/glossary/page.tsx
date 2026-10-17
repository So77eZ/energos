import { drinkApi, enrichDrinks } from '@entities/drink'
import { GlossaryPage } from '@widgets/glossary-page/ui/GlossaryPage'

export const metadata = { title: 'Словарь — Energos' }
export const dynamic = 'force-dynamic'

export default async function GlossaryRoute() {
  // Drinks нужны для примеров «МИН/МАКС» по каждой метрике.
  const drinks = await drinkApi.list().catch(() => [])

  const enriched = enrichDrinks(drinks)
  return <GlossaryPage drinks={enriched} />
}
