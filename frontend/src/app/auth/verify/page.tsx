import { VerifyEmailForm } from '@features/auth/ui/VerifyEmailForm'
import { AuthCard } from '@widgets/auth-page/ui/AuthCard'

export const metadata = { title: 'Подтверждение e-mail — Energos' }

// Сюда ведёт ссылка из письма: /auth/verify?token=…
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <AuthCard
      eyebrow="ПОДТВЕРЖДЕНИЕ E-MAIL"
      title="Почти готово"
      blurb="Подтверждаем адрес — после этого можно оставлять отзывы."
    >
      <VerifyEmailForm token={token ?? null} />
    </AuthCard>
  )
}
