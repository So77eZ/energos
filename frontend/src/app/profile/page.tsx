import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { authApi } from '@entities/user'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { ProfilePage } from '@widgets/profile/ui/ProfilePage'

export const metadata = { title: 'Личный кабинет — Energos' }
export const dynamic = 'force-dynamic'

export default async function ProfileRoute({ searchParams }: PageProps<'/profile'>) {
  const { tab } = await searchParams
  const login = tab === 'appearance' || tab === 'account'
    ? `${ROUTES.auth.login}?${new URLSearchParams({ return: `${ROUTES.profile}?tab=${tab}` })}`
    : ROUTES.auth.login
  const token = await getToken()
  if (!token) redirect(login)

  const [user, reviews, drinks] = await Promise.all([
    authApi.me(token).catch(() => null),
    reviewApi.myReviews(token).catch(() => []),
    drinkApi.list().catch(() => []),
  ])

  if (!user) redirect(login)

  return (
    <Suspense fallback={null}>
      <ProfilePage user={user} reviews={reviews} drinks={drinks} />
    </Suspense>
  )
}
