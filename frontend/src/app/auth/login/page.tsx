import { LoginForm } from '@features/auth/ui/LoginForm'

export const metadata = { title: 'Вход — Energos' }

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoginForm />
    </div>
  )
}
