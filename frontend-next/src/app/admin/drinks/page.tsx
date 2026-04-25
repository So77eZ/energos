import { redirect } from 'next/navigation'
import { drinkApi } from '@entities/drink'
import { getToken } from '@shared/lib/session'
import { AdminDrinksList } from '@widgets/admin-drinks/ui/AdminDrinksList'
import { ROUTES } from '@shared/config/routes'

export const metadata = { title: 'Управление — Energos' }
export const dynamic = 'force-dynamic'

export default async function AdminDrinksPage() {
  const token = await getToken()
  if (!token) redirect(ROUTES.auth.login)

  const drinks = await drinkApi.list().catch(() => [])

  return <AdminDrinksList drinks={drinks} />
}
