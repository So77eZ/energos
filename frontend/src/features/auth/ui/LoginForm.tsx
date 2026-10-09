'use client'

import { useActionState, useEffect } from 'react'
import { Icons } from '@shared/ui/icons'
import { loginAction } from '../model/actions'

export function LoginForm({ returnTo = '/' }: { returnTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  useEffect(() => {
    if (state?.success) {
      window.location.href = returnTo
    }
  }, [state?.success, returnTo])

  return (
    <form action={formAction} className="auth-fields">
      {state?.error && <p className="auth-error">{state.error}</p>}

      <div className="auth-field">
        <label htmlFor="login-username">E-mail</label>
        {/* name="username" оставлен: так поле зовётся в форме логина бэка (OAuth2PasswordRequestForm). */}
        <input
          id="login-username"
          name="username"
          type="email"
          defaultValue={state?.username}
          placeholder="you@example.com"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">Пароль</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="cta-primary auth-submit" disabled={isPending}>
        {isPending ? 'Вход…' : (<>Войти <Icons.arrow w={14} /></>)}
      </button>
    </form>
  )
}
