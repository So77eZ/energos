import { ResetPasswordForm } from '@features/auth/ui/ResetPasswordForm'
import { AuthCard } from '@widgets/auth-page/ui/AuthCard'

export const metadata = { title: 'Новый пароль — Energos' }

// Сюда ведёт ссылка из письма: /auth/reset-password?token=…
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <AuthCard
      eyebrow="СБРОС ПАРОЛЯ"
      title="Новый пароль"
      blurb="Придумайте новый пароль для входа."
    >
      <ResetPasswordForm token={token ?? null} />
    </AuthCard>
  )
}
