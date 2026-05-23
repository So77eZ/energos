import { Suspense } from 'react'
import { drinkApi, enrichDrinks } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { ComparePage } from '@widgets/compare-page/ui/ComparePage'

export const metadata = { title: 'Сравнение — Energos' }
export const dynamic = 'force-dynamic'

export default async function CompareRoute() {
  const [drinks, allReviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  const enriched = enrichDrinks(drinks, allReviews)

  // ComparePage uses useSearchParams (для шарящихся URL'ов) — клиентский хук,
  // оборачиваем в Suspense чтобы Next не ругался на бан CSR-границу.
  return (
    <Suspense fallback={null}>
      <ComparePage drinks={enriched} />
    </Suspense>
  )
}
