'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { ROUTES } from '@shared/config/routes'
import { forgotPasswordAction } from '../model/actions'

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null)

  if (state?.sent) {
    return (
      <>
        <p className="auth-notice" role="status">
          Если аккаунт с адресом <b>{state.email}</b> существует, мы отправили письмо со ссылкой для
          сброса пароля. Проверьте почту (и папку «Спам»).
        </p>
        <Link href={ROUTES.auth.login} className="cta-ghost auth-submit">Вернуться ко входу</Link>
      </>
    )
  }

  return (
    <form action={formAction} className="auth-fields" style={{ marginTop: 0 }}>
      {state?.error && <p className="auth-error" role="alert">{state.error}</p>}

      <div className="auth-field">
        <label htmlFor="forgot-email">E-mail</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          defaultValue={state?.email}
          placeholder="you@example.com"
          required
          maxLength={254}
          autoComplete="email"
        />
      </div>

      <button type="submit" className="cta-primary auth-submit" disabled={isPending}>
        {isPending ? 'Отправляем…' : 'Отправить ссылку'}
      </button>
      <Link href={ROUTES.auth.login} className="auth-link">Вспомнили пароль? Войти</Link>
    </form>
  )
}
