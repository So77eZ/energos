'use client'

import { navItemsFor } from '../model/nav-items'
import { usePriorityNav } from '../model/usePriorityNav'
import { NavLink } from './NavLink'
import { MoreMenu, MoreButtonInner } from './MoreMenu'
import { useTheme } from '@shared/lib/theme'

interface HeaderNavProps {
  isAdmin: boolean
}

export function HeaderNav({ isAdmin }: HeaderNavProps) {
  const { gachapon } = useTheme()
  const items = navItemsFor(isAdmin)
  const { visible, overflow, showMore, navRef, measureRef } = usePriorityNav(items, gachapon)

  return (
    <div className="hdr-nav-flow" ref={navRef}>
      <div className="hdr-nav-items">
        {visible.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {showMore && <MoreMenu overflow={overflow} />}
      </div>

      <div className="hdr-nav-measure" ref={measureRef} aria-hidden="true">
        {items.map((item) => (
          <NavLink key={`m-${item.href}`} item={item} measure />
        ))}
        <span className="nav-link hdr-more-btn" data-mm>
          <MoreButtonInner />
        </span>
      </div>
    </div>
  )
}
