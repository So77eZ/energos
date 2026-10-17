import type { ReactNode } from 'react'

interface AuthCardProps {
  eyebrow: string
  title: string
  blurb: string
  children: ReactNode
}

/** Простая карточка для служебных страниц авторизации (подтверждение e-mail, сброс пароля) —
 *  в отличие от AuthPage без вкладок «Вход/Регистрация» и демо-банки. */
export function AuthCard({ eyebrow, title, blurb, children }: AuthCardProps) {
  return (
    <div className="page page-auth">
      <div className="auth-stage">
        <div className="auth-form">
          <div className="auth-form-head">
            <div className="auth-eyebrow">{eyebrow}</div>
            <h1 className="auth-title">{title}</h1>
            <p className="auth-blurb">{blurb}</p>
          </div>
          <div className="auth-fields">{children}</div>
        </div>
      </div>
    </div>
  )
}
