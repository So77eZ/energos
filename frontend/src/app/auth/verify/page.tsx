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
      blurb="Нажмите кнопку, чтобы подтвердить адрес и открыть отзывы."
    >
      <VerifyEmailForm token={token ?? null} />
    </AuthCard>
  )
}
