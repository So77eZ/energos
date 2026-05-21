'use client'

import { useActionState } from 'react'
import { Icons } from '@shared/ui/icons'
import { loginAction } from '../model/actions'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="auth-fields">
      {state?.error && <p className="auth-error">{state.error}</p>}

      <div className="auth-field">
        <label htmlFor="login-username">Логин</label>
        <input
          id="login-username"
          name="username"
          placeholder="например: neon_drift"
          required
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9_\-]+"
          title="Только буквы, цифры, _ и -"
          autoComplete="username"
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
