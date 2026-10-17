import Link from 'next/link'
import { Suspense } from 'react'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { authApi } from '@entities/user'
import { HeaderSearchBar } from './HeaderSearchBar'
import { LogoLink } from './LogoLink'
import { HeaderNav } from './HeaderNav'
import { HeaderAvatar } from './HeaderAvatar'
import { MobileNav } from './MobileNav'
import { HeaderTicker, type TickerItem } from './HeaderTicker'

export async function Header() {
  const token = await getToken()
  const currentUser = token ? await authApi.me(token).catch(() => null) : null
  const isAdmin = currentUser?.role === 'admin'

  // Тикер «последние отзывы» пуст: `GET /reviews/` отдаёт отзывы только по одному напитку и без
  // даты создания, ленты отзывов по всему каталогу в API нет (docs/mvp-backend-questions.md).
  const tickerItems: TickerItem[] = []

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <LogoLink />

        {/* Мобильная крошка + кнопки (поиск/бургер) + порталы tabs/sheet/overlay */}
        <MobileNav isAdmin={isAdmin} hasUser={!!currentUser} userAvatar={currentUser?.username?.[0]?.toUpperCase()} />

        <Suspense fallback={<div className="hdr-search" />}>
          <HeaderSearchBar />
        </Suspense>

        <nav className="hdr-nav" aria-label="Основная навигация">
          <HeaderNav isAdmin={isAdmin} />
          <div className="hdr-nav-trail">
            {currentUser ? (
              <HeaderAvatar user={currentUser} />
            ) : (
              <Link href={ROUTES.auth.login} className="nav-cta">
                Войти
              </Link>
            )}
          </div>
        </nav>
      </div>

      <HeaderTicker items={tickerItems} />
    </header>
  )
}
