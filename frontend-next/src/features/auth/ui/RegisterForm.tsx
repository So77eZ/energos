'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { registerAction } from '../model/actions'
import { ROUTES } from '@shared/config/routes'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="glass rounded-xl p-8 w-full max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-bold text-[#f0f0f5] text-center">Регистрация</h1>

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
        autoComplete="username"
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
      />
      <div className="flex flex-col gap-1">
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          required
          minLength={8}
          autoComplete="new-password"
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
        />
        <p className="text-[11px] text-[#9090a8] px-1">
          Минимум 8 символов, заглавная и строчная буква, цифра
        </p>
      </div>
      <input
        name="confirm"
        type="password"
        placeholder="Повторите пароль"
        required
        autoComplete="new-password"
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
      />

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" />
        {isPending ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>

      <p className="text-center text-xs text-[#9090a8]">
        Уже есть аккаунт?{' '}
        <Link href={ROUTES.auth.login} className="text-neon-cyan hover:underline">
          Войти
        </Link>
      </p>
    </form>
  )
}
