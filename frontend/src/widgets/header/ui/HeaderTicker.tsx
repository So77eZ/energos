'use client'

import { useEffect, useRef, useState } from 'react'
export interface TickerItem {
  id: number
  who: string
  drinkName: string
  score: number
  ago: string
}

export function HeaderTicker({ items }: { items: TickerItem[] }) {
  // Заморозка анимации при reduced-motion / скрытой вкладке.
  const [frozen, setFrozen] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(80)

  useEffect(() => {
    // reduced-motion заморозку делает gated CSS (уважает data-force-motion);
    // здесь — только пауза анимации на скрытой вкладке.
    const onVis = () => setFrozen(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
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
              <span className="ticker-ago">{a.ago}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
