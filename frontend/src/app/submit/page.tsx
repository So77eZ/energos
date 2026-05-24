import { authApi } from '@entities/user'
import { getToken } from '@shared/lib/session'
import { SubmitPage } from '@widgets/submit-page/ui/SubmitPage'

export const metadata = { title: 'Предложить — Energos' }
export const dynamic = 'force-dynamic'

export default async function SubmitRoute() {
  const token = await getToken()
  const currentUser = token ? await authApi.me(token).catch(() => null) : null
  return <SubmitPage currentUser={currentUser} />
}
