import Link from 'next/link'
import { Suspense } from 'react'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { authApi } from '@entities/user'
import { Icons } from '@shared/ui/icons'
import { HeaderSearchBar } from './HeaderSearchBar'
import { HeaderNav } from './HeaderNav'
import { HeaderAvatar } from './HeaderAvatar'

export async function Header() {
  const token = await getToken()
  const currentUser = token ? await authApi.me(token).catch(() => null) : null
  const isAdmin = currentUser?.role === 'admin'

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <Link href={ROUTES.home} className="logo">
          <span className="logo-bolt">
            <Icons.bolt w={18} />
          </span>
          <span className="logo-word">ENERGOS</span>
          <span className="logo-meta">/ v3.0</span>
        </Link>

        <Suspense fallback={<div className="hdr-search" />}>
          <HeaderSearchBar />
        </Suspense>

        <nav className="hdr-nav" aria-label="Основная навигация">
          <HeaderNav isAdmin={isAdmin} />
          {currentUser ? (
            <HeaderAvatar user={currentUser} />
          ) : (
            <Link href={ROUTES.auth.login} className="nav-cta">
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
