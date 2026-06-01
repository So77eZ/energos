import { ROUTES } from '@shared/config/routes'
import type { IconName } from '@shared/ui/icons'

export interface NavItem {
  href: string
  label: string
  icon: IconName
  adminOnly?: boolean
}

// Порядок = приоритет вытеснения. Хвост («Отзывы», «Предложить») уходит в «Ещё» первым.
export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.home, label: 'Каталог', icon: 'grid' },
  { href: ROUTES.tasteMap, label: 'Карта вкусов', icon: 'map' },
  { href: ROUTES.tier, label: 'Tier list', icon: 'trophy' },
  { href: ROUTES.compare(), label: 'Сравнение', icon: 'scale' },
  { href: ROUTES.glossary, label: 'Словарь', icon: 'book' },
  { href: ROUTES.reviews(), label: 'Отзывы', icon: 'msg' },
  { href: ROUTES.submit, label: 'Предложить', icon: 'plus' },
  { href: ROUTES.admin.drinks, label: 'Управление', icon: 'sliders', adminOnly: true },
]

// 4 фиксированных таба нижней панели. Остальное (вкл. admin) — в sheet «Меню».
export const MOBILE_TABS: NavItem[] = [
  { href: ROUTES.home, label: 'Каталог', icon: 'grid' },
  { href: ROUTES.tasteMap, label: 'Карта', icon: 'map' },
  { href: ROUTES.compare(), label: 'Сравнить', icon: 'scale' },
  { href: ROUTES.profile, label: 'Профиль', icon: 'user' },
]

/** Видимые разделы с учётом роли. */
export function navItemsFor(isAdmin: boolean): NavItem[] {
  return NAV_ITEMS.filter((i) => !i.adminOnly || isAdmin)
}

/** Разделы для sheet: всё что не в табах (по href без query) + admin при isAdmin. */
export function sheetItemsFor(isAdmin: boolean): NavItem[] {
  const tabHrefs = new Set(MOBILE_TABS.map((t) => t.href.split('?')[0]))
  return navItemsFor(isAdmin).filter((i) => !tabHrefs.has(i.href.split('?')[0]))
}

export function isActive(pathname: string, href: string): boolean {
  const base = href.split('?')[0]
  if (base === '/') return pathname === '/'
  return pathname === base || pathname.startsWith(base + '/')
}
