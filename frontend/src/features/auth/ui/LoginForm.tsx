'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { loginAction } from '../model/actions'
import { ROUTES } from '@shared/config/routes'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="glass rounded-xl p-8 w-full max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#f0f0f5] text-center">Вход</h1>

      {state?.error && (
        <p className="text-sm text-neon-red bg-neon-red/10 border border-neon-red/30 rounded-lg px-3 py-2 text-center">
          {state.error}
        </p>
      )}

      <input
        name="username"
        placeholder="Логин"
        required
        minLength={3}
        maxLength={50}
        pattern="[a-zA-Z0-9_\-]+"
        title="Только буквы, цифры, _ и -"
        autoComplete="username"
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
      />

      <input
        name="password"
        type="password"
        placeholder="Пароль"
        required
        autoComplete="current-password"
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
      />

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
      >
        <LogIn className="w-4 h-4" />
        {isPending ? 'Вход…' : 'Войти'}
      </button>

      <p className="text-center text-xs text-[#9090a8]">
        Нет аккаунта?{' '}
        <Link href={ROUTES.auth.register} className="text-neon-cyan hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  )
}
