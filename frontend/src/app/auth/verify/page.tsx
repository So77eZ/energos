import { VerifyEmailForm } from '@features/auth/ui/VerifyEmailForm'

export const metadata = { title: 'Подтверждение e-mail — Energos' }

// Сюда ведёт ссылка из письма: /auth/verify?token=...
// (бэкендеру: в письме сейчас http://localhost:8000/api/v1/auth/verify — GET там нет, см. docs/mvp-backend-questions.md).
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return (
    <div className="page page-auth">
      <div className="auth-stage">
        <div className="auth-form">
          <div className="auth-form-head">
            <div className="auth-eyebrow">ПОДТВЕРЖДЕНИЕ E-MAIL</div>
            <h1 className="auth-title">Почти готово</h1>
            <p className="auth-blurb">Нажмите кнопку, чтобы подтвердить адрес и открыть отзывы.</p>
          </div>
          <div className="auth-fields">
            <VerifyEmailForm token={token ?? null} />
          </div>
        </div>
      </div>
    </div>
  )
}
