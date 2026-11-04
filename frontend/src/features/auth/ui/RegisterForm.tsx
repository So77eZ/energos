'use client'

import { useActionState } from 'react'
import { Icons } from '@shared/ui/icons'
import { registerAction } from '../model/actions'

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  // Пользователь уже вошёл (registerAction ставит cookie), но отзывы откроются только после
  // подтверждения e-mail — говорим об этом сразу, а не молча уводим на главную.
  if (state?.success) {
    return (
      <div className="auth-fields">
        <p className="auth-notice" role="status">
          Аккаунт создан. Мы отправили письмо на <b>{state.username}</b> — перейдите по ссылке
          из него, чтобы подтвердить e-mail и оставлять отзывы.
        </p>
        <span className="auth-field-hint">Письма нет несколько минут? Проверьте «Спам» или запросите его ещё раз в профиле.</span>
        {/* Полная перезагрузка, а не Link: шапка должна увидеть новую сессию. */}
        <a href="/" className="cta-primary auth-submit">На главную <Icons.arrow w={14} /></a>
      </div>
    )
  }

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
        <label htmlFor="register-nickname">Имя</label>
        <input
          id="register-nickname"
          name="nickname"
          type="text"
          defaultValue={state?.nickname}
          placeholder="Как вас показывать в отзывах"
          required
          minLength={3}
          maxLength={32}
          autoComplete="nickname"
        />
        <span className="auth-field-hint">
          Увидят другие пользователи рядом с вашими отзывами. 3–32 символа: латинские буквы, цифры, «_» и «-»
        </span>
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
