'use client'

import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { IconDots, IconChevron, IconDice } from '@shared/ui/icons'
import { isActive, type NavItem } from '../model/nav-items'
import { useTheme } from '@shared/lib/theme'
import { useGachapon } from '@shared/lib/gachapon'
import { usePopover } from '@shared/lib/usePopover'
import { NavMenuLink } from './NavMenuLink'

interface MoreMenuProps {
  overflow: NavItem[]
}

/** Внутренность кнопки «Ещё» (иконки + лейбл). Общая для реальной кнопки и
 *  скрытого замерочного ряда в HeaderNav — иначе ширины рассинхронятся и
 *  priority+ расчёт переполнения собьётся. */
export function MoreButtonInner() {
  return (
    <>
      <IconDots w={16} />
      <span className="nav-link-lbl">Ещё</span>
      <IconChevron w={12} />
    </>
  )
}

export function MoreMenu({ overflow }: MoreMenuProps) {
  const pathname = usePathname()
  const { gachapon } = useTheme()
  const { open: openGachapon } = useGachapon()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const overflowActive = overflow.some((r) => isActive(pathname, r.href))

  // Закрытие по клику вне / Esc / смене маршрута.
  usePopover(ref, open, () => setOpen(false))

  return (
    <div className="hdr-more" ref={ref}>
      <button
        type="button"
        className={`nav-link hdr-more-btn${overflowActive ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreButtonInner />
      </button>
      {open && (
        <div className="hdr-more-menu" role="menu">
          {gachapon && (
            <button
              type="button"
              role="menuitem"
              className="hdr-more-item"
              onClick={() => { setOpen(false); openGachapon() }}
            >
              <IconDice w={15} />
              <span>Рулетка</span>
              <span className="hdr-more-tag">случайный</span>
            </button>
          )}
          {overflow.map((r) => (
            <NavMenuLink
              key={r.href}
              item={r}
              className="hdr-more-item"
              iconSize={15}
              role="menuitem"
              onNavigate={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
