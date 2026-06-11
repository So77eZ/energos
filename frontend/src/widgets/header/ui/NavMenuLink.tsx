'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconArrow } from '@shared/ui/icons'
import { isActive, type NavItem } from '../model/nav-items'

interface NavMenuLinkProps {
  item: NavItem
  /** Базовый класс пункта (`hdr-more-item` десктоп / `mob-sheet-item` мобилка). */
  className: string
  iconSize: number
  role?: string
  onNavigate: () => void
}

/** Routed-пункт overflow-меню: иконка + лейбл + стрелка + active-стейт.
 *  Общий для desktop-дропдауна (MoreMenu) и мобильного sheet (MobileNav) —
 *  раньше дублировался; различаются лишь класс/размер иконки/role. */
export function NavMenuLink({ item, className, iconSize, role, onNavigate }: NavMenuLinkProps) {
  const pathname = usePathname()
  const Icon = item.icon
  const active = isActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      role={role}
      className={`${className}${active ? ' active' : ''}`}
      onClick={onNavigate}
    >
      <Icon w={iconSize} />
      <span>{item.label}</span>
      <IconArrow w={12} />
    </Link>
  )
}
