'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { ROUTES } from '@shared/config/routes'
import { resetPasswordAction } from '../model/actions'

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)

  if (!token) {
    return (
      <>
        <p className="auth-error" role="alert">В ссылке нет токена. Откройте ссылку из письма целиком.</p>
        <Link href={ROUTES.auth.forgotPassword} className="cta-ghost auth-submit">Запросить письмо заново</Link>
      </>
    )
  }

  if (state?.success) {
    return (
      <>
        <p className="auth-notice" role="status">Пароль изменён. Теперь можно войти с новым паролем.</p>
        <Link href={ROUTES.auth.login} className="cta-primary auth-submit">Войти</Link>
      </>
    )
  }

  return (
    <form action={formAction} className="auth-fields" style={{ marginTop: 0 }}>
      {state?.error && (
        <p className="auth-error" role="alert">
          {state.error}{' '}
          <Link href={ROUTES.auth.forgotPassword} className="auth-link">Запросить письмо заново</Link>
        </p>
      )}
      <input type="hidden" name="token" value={token} />

      <div className="auth-field">
        <label htmlFor="reset-password">Новый пароль</label>
        <input
          id="reset-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <span className="auth-field-hint">Минимум 8 символов, без вашего e-mail</span>
      </div>

      <div className="auth-field">
        <label htmlFor="reset-confirm">Подтверждение пароля</label>
        <input
          id="reset-confirm"
          name="confirm"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="cta-primary auth-submit" disabled={isPending}>
        {isPending ? 'Сохраняем…' : 'Сменить пароль'}
      </button>
    </form>
  )
}
