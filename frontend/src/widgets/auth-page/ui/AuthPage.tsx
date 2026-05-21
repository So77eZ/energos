import Link from 'next/link'
import type { ReactNode } from 'react'
import { EnergyCan } from '@entities/drink'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'

interface AuthPageProps {
  mode: 'login' | 'register'
  children: ReactNode
}

// Static demo can spec for the auth visual — no API data needed on these
// public routes. Stripe is the active accent (themed via CSS var on the
// auth-vis layer); we pick a neutral default for the SVG itself.
const DEMO_CAN = {
  body: '#0d1d36',
  stripe: '#00e5ff',
  accent: '#ff2e88',
  label: 'ENERGOS',
  code: 'auth-can',
}

export function AuthPage({ mode, children }: AuthPageProps) {
  const isLogin = mode === 'login'

  return (
    <div className="page page-auth">
      <div className="auth-stage">
        <div className="auth-vis" aria-hidden="true">
          <div className="auth-vis-glow" />
          <div className="auth-vis-grid" />
          <div className="auth-vis-can">
            <EnergyCan can={DEMO_CAN} w={200} h={440} />
          </div>
          <div className="auth-vis-lines">
            <div className="auth-line" />
            <div className="auth-line" />
            <div className="auth-line" />
          </div>
        </div>

        <div className="auth-form">
          <div className="auth-form-head">
            <Link href={ROUTES.home} className="logo">
              <span className="logo-bolt">
                <Icons.bolt w={18} />
              </span>
              <span className="logo-word">ENERGOS</span>
            </Link>
            <div className="auth-eyebrow">{isLogin ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ'}</div>
            <h1 className="auth-title">
              {isLogin ? 'Добро пожаловать' : 'Создай аккаунт'}
            </h1>
            <p className="auth-blurb">
              {isLogin
                ? 'Войди, чтобы оставлять отзывы и оценивать вкус энергетиков.'
                : 'Присоединяйся к комьюнити — оценивай вкусы, сравнивай напитки.'}
            </p>
          </div>

          <nav className="auth-tabs" aria-label="Режим авторизации">
            <Link
              href={ROUTES.auth.login}
              className={`auth-tab${isLogin ? ' active' : ''}`}
              aria-current={isLogin ? 'page' : undefined}
            >
              Вход
            </Link>
            <Link
              href={ROUTES.auth.register}
              className={`auth-tab${!isLogin ? ' active' : ''}`}
              aria-current={!isLogin ? 'page' : undefined}
            >
              Регистрация
            </Link>
          </nav>

          {children}

          <p className="auth-foot">
            {isLogin ? (
              <>Ещё нет аккаунта? <Link href={ROUTES.auth.register} className="auth-link">Зарегистрироваться</Link></>
            ) : (
              <>Уже зарегистрирован? <Link href={ROUTES.auth.login} className="auth-link">Войти</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
