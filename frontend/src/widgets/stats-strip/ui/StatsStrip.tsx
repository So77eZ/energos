import { Icons } from '@shared/ui/icons'
import type { EnrichedDrink } from '@entities/drink'

interface StatsStripProps {
  drinks: EnrichedDrink[]
}

type Hue = 'cyan' | 'pink' | 'lime' | 'amber' | 'purple'

interface StatItem {
  lbl: string
  val: string | number
  sub: string
  icon: React.ReactNode
  hue: Hue
}

export function StatsStrip({ drinks }: StatsStripProps) {
  const total = drinks.length
  const rated = drinks.filter((d) => d.rating != null)
  const avg = rated.length > 0
    ? (rated.reduce((s, d) => s + (d.rating ?? 0), 0) / rated.length).toFixed(1)
    : '—'
  const noSugar = drinks.filter((d) => d.no_sugar).length
  const fresh = drinks.filter((d) => d.isNew).length
  const noSugarPct = total > 0 ? Math.round((noSugar / total) * 100) : 0

  const items: StatItem[] = [
    { lbl: 'НАПИТКОВ В БАЗЕ',   val: total,   sub: 'позиций',            icon: <Icons.pkg />,      hue: 'cyan' },
    { lbl: 'СРЕДНИЙ РЕЙТИНГ',   val: avg,     sub: 'из 5.0',             icon: <Icons.star />,     hue: 'pink' },
    { lbl: 'БЕЗ САХАРА',        val: noSugar, sub: `${noSugarPct}% каталога`, icon: <Icons.candyOff />, hue: 'lime' },
    { lbl: 'НОВЫЕ ЗА НЕДЕЛЮ',   val: fresh,   sub: 'добавлены недавно',  icon: <Icons.flame />,    hue: 'amber' },
  ]

  return (
    <div className="stats">
      {items.map((s, i) => (
        <div key={i} className={`stat-card stat-${s.hue}`}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-lbl">{s.lbl}</div>
          <div className="stat-val">{s.val}</div>
          <div className="stat-sub">{s.sub}</div>
          <div className="stat-corner" />
        </div>
      ))}
    </div>
  )
}
