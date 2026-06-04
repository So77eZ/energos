import type { Achievement } from '../model/types'
import { BADGE_ICONS } from '../model/badge-icons'

interface MiniBadgeProps {
  badge: Pick<Achievement, 'id' | 'tier' | 'name'>
  shape?: 'hex' | 'shield' | 'circle'
  tip?: boolean
}

export function MiniBadge({ badge, shape = 'hex', tip = true }: MiniBadgeProps) {
  const Glyph = BADGE_ICONS[badge.id] ?? BADGE_ICONS._default
  return (
    <span
      className={`mini-badge medal-${badge.tier} shape-${shape}`}
      data-tip={tip ? badge.name : undefined}
      tabIndex={tip ? 0 : undefined}
      aria-label={badge.name}
    >
      <span className="medal-frame">
        <span className="medal-core"><Glyph /></span>
      </span>
    </span>
  )
}
