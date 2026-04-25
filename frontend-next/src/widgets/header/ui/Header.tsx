import Link from 'next/link'
import { Suspense } from 'react'
import { Zap, Map, MessageSquare, Settings, User } from 'lucide-react'
import { ROUTES } from '@shared/config/routes'
import { getToken } from '@shared/lib/session'
import { HeaderSearchBar } from './HeaderSearchBar'

const NAV_LINKS = [
  { href: ROUTES.tasteMap, label: 'Карта вкусов', icon: Map },
  { href: ROUTES.reviews(), label: 'Отзывы', icon: MessageSquare },
  { href: ROUTES.admin.drinks, label: 'Управление', icon: Settings },
] as const

export async function Header() {
  const token = await getToken()

  return (
    <header className="sticky top-0 z-50 glass border-b border-neon-blue/20">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-1.5 text-neon-cyan shrink-0 hover:text-white transition-colors"
        >
          <Zap className="w-5 h-5 fill-neon-cyan" />
          <span className="hidden lg:inline font-bold text-sm tracking-wide">Energos</span>
        </Link>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Suspense fallback={null}>
            <HeaderSearchBar />
          </Suspense>
        </div>

        <nav className="flex items-center gap-1 ml-auto shrink-0" aria-label="Основная навигация">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          {token ? (
            <Link
              href={ROUTES.profile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Профиль</span>
            </Link>
          ) : (
            <Link
              href={ROUTES.auth.login}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#9090a8] hover:text-neon-cyan hover:bg-white/5 transition-colors"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
