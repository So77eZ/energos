import type { CSSProperties } from 'react'
import { topBadgeIds } from '../model/achievements'
import { MiniBadge } from './MiniBadge'

interface BadgeClusterProps {
  ownedIds: string[]
  layout?: 'overlap' | 'row'
  shape?: 'hex' | 'shield' | 'circle'
  max?: number
  clusterBg?: string
}

export function BadgeCluster({ ownedIds, layout = 'overlap', shape = 'hex', max = 3, clusterBg }: BadgeClusterProps) {
  const top = topBadgeIds(ownedIds, max)
  if (top.length === 0) return null
  const style = clusterBg ? ({ '--cluster-bg': clusterBg } as CSSProperties) : undefined
  return (
    <span className={`badge-cluster cluster-${layout}`} style={style}>
      {top.map((b) => <MiniBadge key={b.id} badge={b} shape={shape} />)}
    </span>
  )
}
