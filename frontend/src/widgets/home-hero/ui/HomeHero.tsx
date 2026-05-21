'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { cleanDrinkName, EnergyCan, splitDrinkBrand, TierBadge } from '@entities/drink'
import type { EnrichedDrink } from '@entities/drink'
import { HexRadar, METRIC_COLOR_VARS, METRIC_KEYS, METRIC_LABELS } from '@entities/review'

interface HomeHeroProps {
  drink: EnrichedDrink
  rank: number
}

export function HomeHero({ drink, rank }: HomeHeroProps) {
  const cleaned = cleanDrinkName(drink.name)
  const { brand, variant } = splitDrinkBrand(cleaned)
  const blend = drink.blend
  const style: CSSProperties & { '--blend'?: string } = { '--blend': blend }

  const rating = drink.rating ?? 0
  const reviews = drink.reviewCount
  const index = (rating * 1.7).toFixed(2)
  const trend = `+${Math.floor(reviews / 12)}%`

  return (
    <section className="hero" style={style}>
      <div className="hero-grid">
        <div className="hero-vis">
          <div className="hero-rank">
            <span className="hero-rank-tag">TOP RATED</span>
            <span className="hero-rank-num">#{String(rank).padStart(2, '0')}</span>
          </div>
          <div className="hero-can-wrap">
            <div
              className="hero-can-glow"
              style={{ background: `radial-gradient(circle, rgba(${blend},0.45), transparent 70%)` }}
            />
            {drink.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={drink.image_url} alt={drink.name} style={{ maxHeight: 400, width: 'auto', position: 'relative', zIndex: 1 }} />
            ) : (
              <EnergyCan can={drink.can} w={180} h={400} />
            )}
          </div>
          <div className="hero-code">
            <span>{brand}</span>
          </div>
        </div>

        <div className="hero-info">
          <div className="hero-tags">
            <span className="tag tag-cyan">
              <Icons.flame />
              ПОПУЛЯРНОЕ
            </span>
            {drink.tier && <TierBadge tier={drink.tier} size="md" />}
            {drink.no_sugar && (
              <span className="tag tag-lime">
                <Icons.candyOff />
                Без сахара
              </span>
            )}
            <span className="tag tag-ghost">{reviews} {reviews === 1 ? 'отзыв' : reviews < 5 ? 'отзыва' : 'отзывов'}</span>
          </div>
          <div className="hero-brand">{brand}</div>
          <h1 className="hero-name">{variant || drink.name}</h1>

          <div className="hero-meta">
            <div className="meta-cell">
              <div className="meta-lbl">РЕЙТИНГ</div>
              <div className="meta-val meta-pink">
                <Icons.star /> {rating.toFixed(1)}
                <span className="meta-of">/5</span>
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-lbl">ЦЕНА</div>
              <div className="meta-val">
                <Icons.rouble /> {drink.price != null ? drink.price.toFixed(2) : '—'}
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-lbl">ИНДЕКС</div>
              <div className="meta-val meta-cyan">
                <Icons.pulse /> {index}
              </div>
            </div>
            <div className="meta-cell">
              <div className="meta-lbl">ТРЕНД</div>
              <div className="meta-val meta-lime">
                <Icons.trend /> {trend}
              </div>
            </div>
          </div>

          <div className="hero-cta-row">
            <Link href={ROUTES.reviews(drink.id)} className="cta-primary">
              Открыть профиль <Icons.arrow />
            </Link>
            <Link href={ROUTES.reviews(drink.id)} className="cta-ghost">
              Оставить отзыв
            </Link>
          </div>
        </div>

        {drink.metrics && (
          <div className="hero-radar">
            <div className="radar-header">
              <span className="radar-title">ВКУСОВОЙ ПРОФИЛЬ</span>
            </div>
            <HexRadar metrics={drink.metrics} size={240} />
            <div className="radar-legend">
              {METRIC_KEYS.map((k) => (
                <div key={k} className="radar-leg">
                  <span className="radar-leg-dot" style={{ background: METRIC_COLOR_VARS[k] }} />
                  <span className="radar-leg-lbl">{METRIC_LABELS[k]}</span>
                  <span className="radar-leg-val">{drink.metrics![k].toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
