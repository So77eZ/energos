import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { drinkApi } from '@entities/drink'
import { authApi } from '@entities/user'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { AdminPage } from '@widgets/admin-page/ui/AdminPage'

export const metadata = { title: 'Управление — Energos' }
export const dynamic = 'force-dynamic'

export default async function AdminRoute() {
  const token = await getToken()
  if (!token) redirect(ROUTES.auth.login)

  const user = await authApi.me(token).catch(() => null)
  if (!user || user.role !== 'admin') redirect(ROUTES.auth.login)

  const drinks = await drinkApi.list().catch(() => [])

  return (
    <Suspense fallback={null}>
      <AdminPage drinks={drinks} />
    </Suspense>
  )
}
