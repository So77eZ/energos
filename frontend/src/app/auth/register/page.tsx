import { RegisterForm } from '@features/auth/ui/RegisterForm'
import { AuthPage } from '@widgets/auth-page/ui/AuthPage'

export const metadata = { title: 'Регистрация — Energos' }

export default function RegisterPage() {
  return (
    <AuthPage mode="register">
      <RegisterForm />
    </AuthPage>
  )
}
