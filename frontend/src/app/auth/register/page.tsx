import { RegisterForm } from '@features/auth/ui/RegisterForm'

export const metadata = { title: 'Регистрация — Energos' }

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RegisterForm />
    </div>
  )
}
