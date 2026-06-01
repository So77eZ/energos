'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { useScrollLock } from '@shared/lib/useScrollLock'
import { isActive, MOBILE_TABS, sheetItemsFor, navItemsFor } from '../model/nav-items'
import { useMobileNav } from '../model/useMobileNav'
import { HeaderSearchBar } from './HeaderSearchBar'

interface MobileNavProps {
  isAdmin: boolean
  hasUser: boolean
  userAvatar?: string
}

export function MobileNav({ isAdmin, hasUser, userAvatar }: MobileNavProps) {
  const pathname = usePathname()
  const { moreOpen, searchOpen, tabsHidden, setMoreOpen, setSearchOpen } = useMobileNav()
  const [mounted, setMounted] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)
  const overlayOpen = moreOpen || searchOpen

  useEffect(() => setMounted(true), [])
  useScrollLock(overlayOpen)

  // Esc закрывает; запоминаем фокус при открытии, возвращаем при закрытии.
  useEffect(() => {
    if (overlayOpen) {
      lastFocus.current = document.activeElement as HTMLElement
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMoreOpen(false)
          setSearchOpen(false)
        }
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
    lastFocus.current?.focus?.()
  }, [overlayOpen, setMoreOpen, setSearchOpen])

  const currentLabel = navItemsFor(isAdmin).find((i) => isActive(pathname, i.href))?.label ?? ''
  const sheetItems = sheetItemsFor(isAdmin)

  return (
    <>
      {/* В потоке шапки: крошка + кнопки (видны только ≤768px через CSS) */}
      <div className="hdr-mobile-crumb">
        <span className="hdr-crumb-sep">/</span>
        <span className="hdr-crumb-label">{currentLabel}</span>
      </div>
      <button type="button" className="hdr-mobile-btn hdr-mobile-search" onClick={() => setSearchOpen(true)} aria-label="Поиск">
        <Icons.search w={18} />
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
              const Icon = Icons[tab.icon]
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
                      <span className="mob-tab-avatar">{userAvatar ?? <Icons.user w={20} />}</span>
                    ) : (
                      <Icon w={20} />
                    )}
                  </span>
                  <span className="mob-tab-lbl">{tab.label}</span>
                </Link>
              )
            })}
            <button type="button" className="mob-tab mob-tab-more" onClick={() => setMoreOpen(true)} aria-label="Ещё">
              <span className="mob-tab-icon"><Icons.sliders w={20} /></span>
              <span className="mob-tab-lbl">Ещё</span>
            </button>
          </nav>,
          document.body,
        )}

      {mounted &&
        moreOpen &&
        createPortal(
          <div className="mob-sheet-overlay" onClick={() => setMoreOpen(false)}>
            <div className="mob-sheet" role="dialog" aria-label="Меню" onClick={(e) => e.stopPropagation()}>
              <div className="mob-sheet-grab" />
              <div className="mob-sheet-head">
                <span className="mob-sheet-title">Меню</span>
                <button type="button" className="mob-sheet-close" onClick={() => setMoreOpen(false)} aria-label="Закрыть">
                  <Icons.x w={18} />
                </button>
              </div>
              <div className="mob-sheet-body">
                {!hasUser && (
                  <Link href={ROUTES.auth.login} className="mob-sheet-cta" onClick={() => setMoreOpen(false)}>
                    <Icons.lock w={14} /> Войти / Регистрация
                  </Link>
                )}
                <div className="mob-sheet-list">
                  {sheetItems.map((r) => {
                    const Icon = Icons[r.icon]
                    const active = isActive(pathname, r.href)
                    return (
                      <Link
                        key={r.href}
                        href={r.href}
                        className={`mob-sheet-item${active ? ' active' : ''}`}
                        onClick={() => setMoreOpen(false)}
                      >
                        <Icon w={16} />
                        <span>{r.label}</span>
                        <Icons.arrow w={12} />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {mounted &&
        searchOpen &&
        createPortal(
          <div className="mob-search-overlay" onClick={() => setSearchOpen(false)}>
            <div className="mob-search" role="dialog" aria-label="Поиск" onClick={(e) => e.stopPropagation()}>
              <HeaderSearchBar forceInput />
              <button type="button" className="mob-search-close" onClick={() => setSearchOpen(false)} aria-label="Закрыть">
                <Icons.x w={16} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
