'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Icons } from '@shared/ui/icons'
import { isActive, type NavItem } from '../model/nav-items'
import { useTheme } from '@shared/lib/theme'
import { useGachapon } from '@shared/lib/gachapon'
import { usePopover } from '@shared/lib/usePopover'

interface MoreMenuProps {
  overflow: NavItem[]
}

/** Внутренность кнопки «Ещё» (иконки + лейбл). Общая для реальной кнопки и
 *  скрытого замерочного ряда в HeaderNav — иначе ширины рассинхронятся и
 *  priority+ расчёт переполнения собьётся. */
export function MoreButtonInner() {
  return (
    <>
      <Icons.dots w={16} />
      <span className="nav-link-lbl">Ещё</span>
      <Icons.chevron w={12} />
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
              <Icons.dice w={15} />
              <span>Рулетка</span>
              <span className="hdr-more-tag">случайный</span>
            </button>
          )}
          {overflow.map((r) => {
            const Icon = Icons[r.icon]
            const active = isActive(pathname, r.href)
            return (
              <Link
                key={r.href}
                href={r.href}
                role="menuitem"
                className={`hdr-more-item${active ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <Icon w={15} />
                <span>{r.label}</span>
                <Icons.arrow w={12} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
