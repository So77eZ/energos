'use client'

import { useActionState, useId } from 'react'
import Link from 'next/link'
import { ROUTES } from '@shared/config/routes'
import { changeEmailAction, changePasswordAction } from '../model/account-actions'

export function AccountSettings({ email }: { email: string }) {
  const id = useId()
  const [emailState, emailAction, emailPending] = useActionState(changeEmailAction, null)
  const [passwordState, passwordAction, passwordPending] = useActionState(changePasswordAction, null)

  return (
    <section className="prof-account" aria-labelledby={`${id}-title`}>
      <header className="prof-appearance-head">
        <h2 id={`${id}-title`} className="prof-appearance-title">Аккаунт</h2>
        <p className="prof-appearance-blurb">Для изменения данных подтвердите текущий пароль.</p>
      </header>
      <div className="prof-account-grid">
        <form action={emailAction} className="prof-account-form" aria-labelledby={`${id}-email-title`}>
          <h3 id={`${id}-email-title`}>Почта</h3>
          <p className="prof-account-hint">Сейчас: <b>{email}</b></p>
          <p className="prof-account-hint">Новый адрес станет логином. После изменения его нужно подтвердить по ссылке из письма.</p>
          {emailState?.success && <p className="auth-notice" role="status">Почта изменена на {emailState.email}. Подтвердите новый адрес по письму.</p>}
          {emailState?.error && <p className="auth-error" role="alert">{emailState.error}</p>}
          <div className="auth-field">
            <label htmlFor={`${id}-email`}>Новый e-mail</label>
            <input id={`${id}-email`} name="email" type="email" autoComplete="email" required
              defaultValue={emailState?.success ? '' : emailState?.email ?? ''} disabled={emailPending} />
          </div>
          <div className="auth-field">
            <label htmlFor={`${id}-email-password`}>Текущий пароль</label>
            <input id={`${id}-email-password`} name="currentPassword" type="password" autoComplete="current-password" required disabled={emailPending} />
          </div>
          <button type="submit" className="cta-primary" disabled={emailPending}>{emailPending ? 'Сохраняем…' : 'Изменить почту'}</button>
        </form>

        <form action={passwordAction} className="prof-account-form" aria-labelledby={`${id}-password-title`}>
          <h3 id={`${id}-password-title`}>Пароль</h3>
          <p className="prof-account-hint">После смены используйте новый пароль для входа. Текущая сессия сохранится.</p>
          {passwordState?.success && <p className="auth-notice" role="status">Пароль изменён.</p>}
          {passwordState?.error && <p className="auth-error" role="alert">{passwordState.error}</p>}
          <div className="auth-field">
            <label htmlFor={`${id}-current-password`}>Текущий пароль</label>
            <input id={`${id}-current-password`} name="currentPassword" type="password" autoComplete="current-password" required disabled={passwordPending} />
          </div>
          <div className="auth-field">
            <label htmlFor={`${id}-new-password`}>Новый пароль</label>
            <input id={`${id}-new-password`} name="password" type="password" autoComplete="new-password" minLength={8} required disabled={passwordPending} aria-describedby={`${id}-password-hint`} />
            <span id={`${id}-password-hint`} className="auth-field-hint">Минимум 8 символов</span>
          </div>
          <div className="auth-field">
            <label htmlFor={`${id}-confirm`}>Повторите новый пароль</label>
            <input id={`${id}-confirm`} name="confirm" type="password" autoComplete="new-password" required disabled={passwordPending} />
          </div>
          <button type="submit" className="cta-primary" disabled={passwordPending}>{passwordPending ? 'Сохраняем…' : 'Изменить пароль'}</button>
          <Link className="auth-link" href={ROUTES.auth.forgotPassword}>Не помню текущий пароль</Link>
        </form>
      </div>
    </section>
  )
}
