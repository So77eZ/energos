import { LoginForm } from '@features/auth/ui/LoginForm'
import { AuthPage } from '@widgets/auth-page/ui/AuthPage'
import { safeReturnPath } from '@shared/lib/safe-return'

export const metadata = { title: 'Вход — Energos' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string; return?: string }>
}) {
  const sp = await searchParams
  const expired = sp.expired === '1'
  const returnTo = safeReturnPath(sp.return) // санитайз на ЧТЕНИИ (anti open-redirect)
  return (
    <AuthPage mode="login">
      {expired && (
        <p className="auth-notice" role="status">
          Сессия истекла — войдите снова, чтобы продолжить.
        </p>
      )}
      <LoginForm returnTo={returnTo} />
    </AuthPage>
  )
}
