import { redirect } from 'next/navigation'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { authApi } from '@entities/user'
import { getToken } from '@shared/lib/session'
import { AdminDrinksList } from '@widgets/admin-drinks/ui/AdminDrinksList'
import { ROUTES } from '@shared/config/routes'

export const metadata = { title: 'Управление — Energos' }
export const dynamic = 'force-dynamic'

export default async function AdminDrinksPage() {
  const token = await getToken()
  if (!token) redirect(ROUTES.auth.login)

  const user = await authApi.me(token).catch(() => null)
  if (!user || user.role !== 'admin') redirect(ROUTES.auth.login)

  const [drinks, reviews] = await Promise.all([
    drinkApi.list().catch(() => []),
    reviewApi.list().catch(() => []),
  ])

  return <AdminDrinksList drinks={drinks} reviewsCount={reviews.length} />
}
