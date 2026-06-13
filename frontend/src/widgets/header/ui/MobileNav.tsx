'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@shared/config/routes'
import { IconSearch, IconUser, IconSliders, IconX, IconDice, IconLock } from '@shared/ui/icons'
import { Sheet } from '@shared/ui/Sheet'
import { isActive, MOBILE_TABS, sheetItemsFor, navItemsFor } from '../model/nav-items'
import { useMobileNav } from '../model/useMobileNav'
import { HeaderSearchBar } from './HeaderSearchBar'
import { NavMenuLink } from './NavMenuLink'
import { useTheme } from '@shared/lib/theme'
import { useGachapon } from '@features/gachapon'

interface MobileNavProps {
  isAdmin: boolean
  hasUser: boolean
  userAvatar?: string
}

export function MobileNav({ isAdmin, hasUser, userAvatar }: MobileNavProps) {
  const pathname = usePathname()
  const { moreOpen, searchOpen, tabsHidden, setMoreOpen, setSearchOpen } = useMobileNav()
  const { gachapon } = useTheme()
  const { open: openGachapon } = useGachapon()
  const [mounted, setMounted] = useState(false)

  // mounted-guard только для mob-tabs (свой портал; не модалка). Шиты порталит Sheet сам.
  useEffect(() => setMounted(true), [])

  const currentLabel = navItemsFor(isAdmin).find((i) => isActive(pathname, i.href))?.label ?? ''
  const sheetItems = sheetItemsFor(isAdmin)

  return (
    <>
      {/* В потоке шапки: крошка + кнопки (видны только ≤640px через CSS) */}
      <div className="hdr-mobile-crumb">
        <span className="hdr-crumb-sep">/</span>
        <span className="hdr-crumb-label">{currentLabel}</span>
      </div>
      <button type="button" className="hdr-mobile-btn hdr-mobile-search" onClick={() => setSearchOpen(true)} aria-label="Поиск" aria-expanded={searchOpen}>
        <IconSearch w={18} />
      </button>
      <button
        type="button"
        className="hdr-mobile-btn hdr-mobile-menu"
        onClick={() => setMoreOpen(true)}
        aria-label="Меню"
        aria-expanded={moreOpen}
      >
        <span className="burger"><span /><span /><span /></span>
      </button>

      {mounted &&
        createPortal(
          <nav className={`mob-tabs${tabsHidden ? ' hidden' : ''}`} aria-label="Мобильная навигация">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon
              const active = isActive(pathname, tab.href)
              const isProfile = tab.href === ROUTES.profile
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`mob-tab${active ? ' active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="mob-tab-icon">
                    {isProfile && hasUser ? (
                      <span className="mob-tab-avatar">{userAvatar ?? <IconUser w={20} />}</span>
                    ) : (
                      <Icon w={20} />
                    )}
                  </span>
                  <span className="mob-tab-lbl">{tab.label}</span>
                </Link>
              )
            })}
            <button type="button" className="mob-tab mob-tab-more" onClick={() => setMoreOpen(true)} aria-label="Ещё">
              <span className="mob-tab-icon"><IconSliders w={20} /></span>
              <span className="mob-tab-lbl">Ещё</span>
            </button>
          </nav>,
          document.body,
        )}

      <Sheet variant="bottom" title="Меню" zIndex={960} open={moreOpen} onClose={() => setMoreOpen(false)}>
        {moreOpen && (
          <div className="mob-sheet-body">
            {gachapon && (
              <button
                type="button"
                className="mob-sheet-cta mob-sheet-cta-ghost"
                onClick={() => { setMoreOpen(false); openGachapon() }}
              >
                <IconDice w={14} /> Случайный напиток
              </button>
            )}
            {!hasUser && (
              <Link href={ROUTES.auth.login} className="mob-sheet-cta" onClick={() => setMoreOpen(false)}>
                <IconLock w={14} /> Войти / Регистрация
              </Link>
            )}
            <div className="mob-sheet-list">
              {sheetItems.map((r) => (
                <NavMenuLink
                  key={r.href}
                  item={r}
                  className="mob-sheet-item"
                  iconSize={16}
                  onNavigate={() => setMoreOpen(false)}
                />
              ))}
            </div>
          </div>
        )}
      </Sheet>

      <Sheet variant="top" zIndex={960} className="mob-search" ariaLabel="Поиск" open={searchOpen} onClose={() => setSearchOpen(false)}>
        {searchOpen && (
          <>
            <HeaderSearchBar forceInput onSubmit={() => setSearchOpen(false)} />
            <button type="button" className="mob-search-close" onClick={() => setSearchOpen(false)} aria-label="Закрыть">
              <IconX w={16} />
            </button>
          </>
        )}
      </Sheet>
    </>
  )
}
