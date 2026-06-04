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
import { NavMenuLink } from './NavMenuLink'
import { useTheme } from '@shared/lib/theme'
import { useGachapon } from '@shared/lib/gachapon'

interface MobileNavProps {
  isAdmin: boolean
  hasUser: boolean
  userAvatar?: string
}

export function MobileNav({ isAdmin, hasUser, userAvatar }: MobileNavProps) {
  const pathname = usePathname()
  const { moreOpen, searchOpen, tabsHidden, overlayOpen, setMoreOpen, setSearchOpen } = useMobileNav()
  const { gachapon } = useTheme()
  const { open: openGachapon } = useGachapon()
  const [mounted, setMounted] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])
  useScrollLock(overlayOpen)

  // Esc закрывает; focus-trap внутри открытого диалога; возврат фокуса при закрытии.
  useEffect(() => {
    if (!overlayOpen) {
      lastFocus.current?.focus?.()
      lastFocus.current = null
      return
    }
    lastFocus.current = document.activeElement as HTMLElement
    const dialog = document.querySelector<HTMLElement>(moreOpen ? '.mob-sheet' : '.mob-search')
    // Список фокусируемых пересобираем НА КАЖДЫЙ Tab, а не один раз: контент
    // диалога меняется (напр. результаты поиска рендерятся после ввода), и
    // захваченный список устарел бы — часть элементов выпала бы из trap.
    const getFocusables = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
            ),
          )
        : []
    getFocusables()[0]?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false)
        setSearchOpen(false)
        return
      }
      if (e.key === 'Tab') {
        const focusables = getFocusables()
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [overlayOpen, moreOpen, setMoreOpen, setSearchOpen])

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
            <div className="mob-sheet" role="dialog" aria-label="Меню" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="mob-sheet-grab" />
              <div className="mob-sheet-head">
                <span className="mob-sheet-title">Меню</span>
                <button type="button" className="mob-sheet-close" onClick={() => setMoreOpen(false)} aria-label="Закрыть">
                  <Icons.x w={18} />
                </button>
              </div>
              <div className="mob-sheet-body">
                {gachapon && (
                  <button
                    type="button"
                    className="mob-sheet-cta"
                    onClick={() => { setMoreOpen(false); openGachapon() }}
                  >
                    <Icons.dice w={14} /> Случайный напиток
                  </button>
                )}
                {!hasUser && (
                  <Link href={ROUTES.auth.login} className="mob-sheet-cta" onClick={() => setMoreOpen(false)}>
                    <Icons.lock w={14} /> Войти / Регистрация
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
            </div>
          </div>,
          document.body,
        )}

      {mounted &&
        searchOpen &&
        createPortal(
          <div className="mob-search-overlay" onClick={() => setSearchOpen(false)}>
            <div className="mob-search" role="dialog" aria-label="Поиск" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <HeaderSearchBar forceInput onSubmit={() => setSearchOpen(false)} />
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
