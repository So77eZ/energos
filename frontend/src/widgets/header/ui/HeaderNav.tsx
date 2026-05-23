'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'

interface HeaderNavProps {
  isAdmin: boolean
}

const ITEMS = [
  { href: ROUTES.home,      label: 'Каталог',       icon: 'grid'  },
  { href: ROUTES.tasteMap,  label: 'Карта вкусов',  icon: 'map'   },
  { href: ROUTES.compare(), label: 'Сравнение',     icon: 'scale' },
  { href: ROUTES.reviews(), label: 'Отзывы',        icon: 'msg'   },
] as const

export function HeaderNav({ isAdmin }: HeaderNavProps) {
  const pathname = usePathname()

  return (
    <>
      {ITEMS.map(({ href, label, icon }) => {
        const Icon = Icons[icon]
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon w={14} />
            <span className="nav-link-lbl">{label}</span>
          </Link>
        )
      })}

      {isAdmin && (
        <Link
          href={ROUTES.admin.drinks}
          className={`nav-link${pathname.startsWith('/admin') ? ' active' : ''}`}
          aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
        >
          <Icons.sliders w={14} />
          <span className="nav-link-lbl">Управление</span>
        </Link>
      )}
    </>
  )
}
