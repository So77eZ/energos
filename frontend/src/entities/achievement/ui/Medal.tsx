import type { Achievement } from '../model/types'
import { BADGE_ICONS } from '../model/badge-icons'

interface MedalProps {
  badge: Pick<Achievement, 'id' | 'tier' | 'name'>
  size?: 'lg' | 'md' | 'sm'
  shape?: 'hex' | 'shield' | 'circle'
}

export function Medal({ badge, size = 'md', shape = 'hex' }: MedalProps) {
  const Glyph = BADGE_ICONS[badge.id] ?? BADGE_ICONS._default
  return (
    <span className={`medal medal-${size} medal-${badge.tier} shape-${shape}`} title={badge.name}>
      <span className="medal-frame">
        <span className="medal-core"><Glyph /></span>
      </span>
    </span>
  )
}
