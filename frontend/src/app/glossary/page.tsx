import { drinkApi, enrichDrinks } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { GlossaryPage } from '@widgets/glossary-page/ui/GlossaryPage'

export const metadata = { title: 'Словарь — Energos' }
export const dynamic = 'force-dynamic'

export default async function GlossaryRoute() {
  // Drinks нужны для примеров «МИН/МАКС» по каждой метрике.
  const [drinks, allReviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  const enriched = enrichDrinks(drinks, allReviews)
  return <GlossaryPage drinks={enriched} />
}
