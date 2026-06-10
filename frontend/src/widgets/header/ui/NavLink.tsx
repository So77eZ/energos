'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActive, type NavItem } from '../model/nav-items'

interface NavLinkProps {
  item: NavItem
  /** Замерочный режим: не интерактивен, помечен data-mi для usePriorityNav. */
  measure?: boolean
}

export function NavLink({ item, measure }: NavLinkProps) {
  const pathname = usePathname()
  const Icon = item.icon
  const active = !measure && isActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      className={`nav-link${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      {...(measure ? { 'data-mi': item.href, tabIndex: -1, 'aria-hidden': true } : {})}
    >
      <Icon w={14} />
      <span className="nav-link-lbl">{item.label}</span>
    </Link>
  )
}
