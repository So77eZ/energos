'use client'

import { useEffect, useRef, useState } from 'react'
import { timeAgo } from '@shared/lib/time-ago'

export interface TickerItem {
  id: number
  who: string
  drinkName: string
  score: number
  createdAt: string
}

export function HeaderTicker({ items }: { items: TickerItem[] }) {
  // Заморозка анимации при reduced-motion / скрытой вкладке.
  const [frozen, setFrozen] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(80)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onVis = () => setFrozen(mq.matches || document.hidden)
    onVis()
    mq.addEventListener('change', onVis)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      mq.removeEventListener('change', onVis)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  // Длительность от ширины контента (≈ 90px/сек), а не фикс 80s.
  useEffect(() => {
    if (rowRef.current) {
      const w = rowRef.current.scrollWidth / 2
      setDuration(Math.max(20, Math.round(w / 90)))
    }
  }, [items])

  if (items.length === 0) return null

  const loop = [...items, ...items]
  return (
    <div className="ticker">
      <span className="ticker-tag">LIVE</span>
      <div className="ticker-track">
        <div
          className={`ticker-row${frozen ? ' frozen' : ''}`}
          ref={rowRef}
          style={{ animationDuration: `${duration}s` }}
        >
          {loop.map((a, i) => (
            <span key={`${a.id}-${i}`} className="ticker-item">
              <span className="ticker-mark">◢</span>
              <b>{a.who}</b> оценил <span className="ticker-target">{a.drinkName}</span>
              <span className="ticker-score"> · {a.score.toFixed(1)}★</span>
              <span className="ticker-ago">{timeAgo(a.createdAt)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
