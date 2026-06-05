import Link from 'next/link'
import { Suspense } from 'react'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { authApi } from '@entities/user'
import { reviewApi, calcRating } from '@entities/review'
import { timeAgo } from '@shared/lib/time-ago'
import { drinkApi } from '@entities/drink'
import { HeaderSearchBar } from './HeaderSearchBar'
import { LogoLink } from './LogoLink'
import { HeaderNav } from './HeaderNav'
import { HeaderAvatar } from './HeaderAvatar'
import { MobileNav } from './MobileNav'
import { HeaderTicker, type TickerItem } from './HeaderTicker'

const TICKER_LIMIT = 8

export async function Header() {
  const token = await getToken()
  const currentUser = token ? await authApi.me(token).catch(() => null) : null
  const isAdmin = currentUser?.role === 'admin'

  // Тикер: последние отзывы + имена напитков. Любая ошибка → пустой тикер.
  const [reviews, drinks] = await Promise.all([
    reviewApi.list().catch(() => []),
    drinkApi.list().catch(() => []),
  ])
  const nameById = new Map(drinks.map((d) => [d.id, d.name]))
  const tickerItems: TickerItem[] = reviews
    .filter((r) => r.created_at && nameById.has(r.energy_drink_id))
    .sort((a, b) => (b.created_at! > a.created_at! ? 1 : b.created_at! < a.created_at! ? -1 : 0))
    .slice(0, TICKER_LIMIT)
    .map((r) => ({
      id: r.id,
      who: r.username ?? 'Гость',
      drinkName: nameById.get(r.energy_drink_id)!,
      score: calcRating(r),
      ago: timeAgo(r.created_at!),
    }))

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
