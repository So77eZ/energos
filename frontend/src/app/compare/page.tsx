import { Suspense } from 'react'
import { drinkApi, enrichDrinks } from '@entities/drink'
import { ComparePage } from '@widgets/compare-page/ui/ComparePage'

export const metadata = { title: 'Сравнение — Energos' }
export const dynamic = 'force-dynamic'

export default async function CompareRoute() {
  const drinks = await drinkApi.list().catch(() => [])
  const enriched = enrichDrinks(drinks)

  // ComparePage uses useSearchParams (для шарящихся URL'ов) — клиентский хук,
  // оборачиваем в Suspense чтобы Next не ругался на бан CSR-границу.
  return (
    <Suspense fallback={null}>
      <ComparePage drinks={enriched} />
    </Suspense>
  )
}
