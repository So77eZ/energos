'use client'

import Link from 'next/link'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { cleanDrinkName, EnergyCan, TIER_COLORS } from '@entities/drink'
import type { EnrichedDrink, Tier } from '@entities/drink'

interface HomeSideRailProps {
  drinks: EnrichedDrink[]
}

const TIERS: Tier[] = ['S', 'A', 'B', 'C', 'D']

export function HomeSideRail({ drinks }: HomeSideRailProps) {
  // Top-3 most-reviewed drinks with reviews — stand-in for "AI similar".
  // Real recommendation lands when we have user-profile matching.
  const featured = [...drinks]
    .filter((d) => d.reviewCount > 0)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 3)

  const tierCounts = TIERS.map((t) => drinks.filter((d) => d.tier === t).length)
  const totalRated = tierCounts.reduce((a, b) => a + b, 0)

  return (
    <aside className="side-rail">
      <div className="rail-card">
        <div className="rail-head">
          <span className="rail-title">
            <Icons.sparkle /> ПОПУЛЯРНОЕ СЕЙЧАС
          </span>
        </div>
        <p className="rail-blurb">Топ-3 напитка по количеству отзывов в каталоге.</p>
        <div className="rail-list">
          {featured.length > 0 ? (
            featured.map((d) => (
              <Link key={d.id} href={ROUTES.reviews(d.id)} className="rail-row">
                <div className="rail-can">
                  {d.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.image_url} alt={d.name} style={{ width: 32, height: 68, objectFit: 'contain' }} />
                  ) : (
                    <EnergyCan can={d.can} w={32} h={68} />
                  )}
                </div>
                <div className="rail-info">
                  <div className="rail-name">{cleanDrinkName(d.name)}</div>
                  <div className="rail-meta">
                    <span className="rail-match">★ {d.rating?.toFixed(1) ?? '—'}</span>
                    <span className="rail-dim">{d.reviewCount} отзывов</span>
                  </div>
                </div>
                <Icons.arrow />
              </Link>
            ))
          ) : (
            <p className="rail-blurb" style={{ opacity: 0.6 }}>Пока нет отзывов — добавьте первый!</p>
          )}
        </div>
      </div>

      <div className="rail-card">
        <div className="rail-head">
          <span className="rail-title">
            <Icons.trophy /> TIER LIST
          </span>
          <Link href={ROUTES.tier} className="rail-link">
            Открыть <Icons.arrow w={10} />
          </Link>
        </div>
        <div className="tier-mini">
          {TIERS.map((t, i) => {
            const count = tierCounts[i]
            const pct = totalRated > 0 ? (count / totalRated) * 100 : 0
            return (
              <div key={t} className="tier-mini-row">
                <span className="tier-mini-letter" style={{ color: TIER_COLORS[t], borderColor: TIER_COLORS[t] }}>
                  {t}
                </span>
                <div className="tier-mini-bar">
                  <div className="tier-mini-fill" style={{ width: `${pct}%`, background: TIER_COLORS[t] }} />
                </div>
                <span className="tier-mini-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
