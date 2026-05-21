import { LoginForm } from '@features/auth/ui/LoginForm'
import { AuthPage } from '@widgets/auth-page/ui/AuthPage'

export const metadata = { title: 'Вход — Energos' }

export default function LoginPage() {
  return (
    <AuthPage mode="login">
      <LoginForm />
    </AuthPage>
  )
}
