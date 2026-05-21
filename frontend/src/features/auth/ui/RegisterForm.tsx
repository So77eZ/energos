'use client'

import { useActionState } from 'react'
import { Icons } from '@shared/ui/icons'
import { registerAction } from '../model/actions'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="auth-fields">
      {state?.error && <p className="auth-error">{state.error}</p>}

      <div className="auth-field">
        <label htmlFor="register-username">Имя пользователя</label>
        <input
          id="register-username"
          name="username"
          placeholder="например: neon_drift"
          required
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9_\-]+"
          title="Только буквы, цифры, _ и -"
          autoComplete="username"
        />
        <span className="auth-field-hint">3–50 символов: буквы, цифры, <code>_</code> и <code>-</code></span>
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
        <span className="auth-field-hint">Минимум 8 символов, заглавная и строчная буква, цифра</span>
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
