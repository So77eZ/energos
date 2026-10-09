'use client'

import { useActionState, useEffect } from 'react'
import { Icons } from '@shared/ui/icons'
import { registerAction } from '../model/actions'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  useEffect(() => {
    if (state?.success) {
      window.location.href = '/'
    }
  }, [state?.success])

  return (
    <form action={formAction} className="auth-fields">
      {state?.error && <p className="auth-error">{state.error}</p>}

      <div className="auth-field">
        <label htmlFor="register-username">E-mail</label>
        <input
          id="register-username"
          name="username"
          type="email"
          defaultValue={state?.username}
          placeholder="you@example.com"
          required
          maxLength={254}
          autoComplete="email"
        />
        <span className="auth-field-hint">На этот адрес придёт письмо для подтверждения аккаунта</span>
      </div>

      <div className="auth-field">
        <label htmlFor="register-password">Пароль</label>
        <input
          id="register-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <span className="auth-field-hint">Минимум 8 символов</span>
      </div>

      <div className="auth-field">
        <label htmlFor="register-confirm">Подтверждение пароля</label>
        <input
          id="register-confirm"
          name="confirm"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="cta-primary auth-submit" disabled={isPending}>
        {isPending ? 'Регистрация…' : (<>Создать аккаунт <Icons.arrow w={14} /></>)}
      </button>
    </form>
  )
}
