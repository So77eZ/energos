'use client'

import Link from 'next/link'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { cleanDrinkName, EnergyCan, type SimilarMatch } from '@entities/drink'

interface SimilarRailProps {
  matches: SimilarMatch[]
}

export function SimilarRail({ matches }: SimilarRailProps) {
  if (matches.length === 0) return null

  return (
    <section className="similar-rail">
      <div className="similar-head">
        <span className="similar-title">
          <Icons.sparkle /> AI: ПОХОЖИЕ ПО ВКУСОВОМУ ПРОФИЛЮ
        </span>
        <span className="similar-sub">L2-расстояние по 6 метрикам</span>
      </div>
      <div className="similar-grid">
        {matches.map(({ drink, match }) => {
          const blend = drink.blend
          return (
            <Link
              key={drink.id}
              href={ROUTES.reviews(drink.id)}
              className="sim-card"
              style={{ ['--blend' as string]: blend }}
            >
              <div
                className="sim-can-wrap"
                style={{ background: `radial-gradient(ellipse at center, rgba(${blend},0.25), transparent 70%)` }}
              >
                {drink.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={drink.image_url}
                    alt={drink.name}
                    style={{ maxHeight: 110, width: 'auto', objectFit: 'contain' }}
                  />
                ) : (
                  <EnergyCan can={drink.can} w={70} h={150} />
                )}
              </div>
              <div className="sim-info">
                <div className="sim-name">{cleanDrinkName(drink.name)}</div>
                <div className="sim-row">
                  <div className="sim-match">
                    <div className="sim-match-bar">
                      <div className="sim-match-fill" style={{ width: `${match * 100}%` }} />
                    </div>
                    <span>{Math.round(match * 100)}%</span>
                  </div>
                  {drink.rating != null && (
                    <span className="sim-rating">
                      <Icons.star /> {drink.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
