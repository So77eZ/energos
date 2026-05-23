import type { Tier } from '../lib/enrich'

type Size = 'xs' | 'sm' | 'md' | 'lg'

interface TierBadgeProps {
  tier: Tier
  size?: Size
}

export const TIER_COLORS: Record<Tier, string> = {
  S: 'var(--c-pink)',
  A: 'var(--c-amber)',
  B: 'var(--c-cyan)',
  C: 'var(--c-blue)',
  D: 'var(--txt-dim)',
}

export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const color = TIER_COLORS[tier]
  return (
    <span
      className={`tier tier-${size}`}
      style={{ color, borderColor: color }}
      aria-label={`Уровень ${tier}`}
    >
      {tier}
    </span>
  )
}
