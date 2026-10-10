import { ForgotPasswordForm } from '@features/auth/ui/ForgotPasswordForm'
import { AuthCard } from '@widgets/auth-page/ui/AuthCard'

export const metadata = { title: 'Сброс пароля — Energos' }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="СБРОС ПАРОЛЯ"
      title="Забыли пароль?"
      blurb="Укажите e-mail аккаунта — пришлём ссылку для установки нового пароля."
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
