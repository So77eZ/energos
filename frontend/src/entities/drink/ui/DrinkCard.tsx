'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { MiniMetrics } from '@entities/review'
import { EnergyCan } from './EnergyCan'
import { TierBadge } from './TierBadge'
import type { EnrichedDrink } from '../lib/enrich'

interface DrinkCardProps {
  drink: EnrichedDrink
  rank?: number | null
  /** Brand displayed before the variant name. Falls back to first name token. */
  brand?: string
}

function splitBrand(name: string, override?: string): { brand: string; variant: string } {
  if (override && override.trim()) {
    const lower = name.toLowerCase()
    const variant = lower.startsWith(override.toLowerCase())
      ? name.slice(override.length).trim()
      : name
    return { brand: override.toUpperCase(), variant: variant || name }
  }
  const firstSpace = name.indexOf(' ')
  if (firstSpace === -1) return { brand: name.toUpperCase(), variant: name }
  return {
    brand: name.slice(0, firstSpace).toUpperCase(),
    variant: name.slice(firstSpace + 1).trim(),
  }
}

export function DrinkCard({ drink, rank = null, brand }: DrinkCardProps) {
  const { brand: brandLbl, variant } = splitBrand(drink.name, brand)
  const blend = drink.blend
  const style: CSSProperties & { '--blend'?: string } = { '--blend': blend }

  return (
    <Link href={ROUTES.reviews(drink.id)} className="card card-glass" style={style}>
      <div className="card-top">
        {rank != null && (
          <div className="card-rank">
            <span className="rank-hash">#</span>
            <span className="rank-num">{String(rank).padStart(2, '0')}</span>
          </div>
        )}
        <div className="card-tags">
          {drink.tier && <TierBadge tier={drink.tier} size="xs" />}
          {drink.isNew && <span className="micro-tag micro-amber">NEW</span>}
          {drink.no_sugar && <span className="micro-tag micro-lime">ZERO</span>}
        </div>
      </div>

      <div
        className="card-vis"
        style={{ background: `radial-gradient(ellipse at center 60%, rgba(${blend},0.28), transparent 70%)` }}
      >
        {drink.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drink.image_url}
            alt={drink.name}
            className="max-h-[180px] w-auto object-contain"
          />
        ) : (
          <EnergyCan can={drink.can} w={110} h={240} />
        )}
      </div>

      <div className="card-body">
        <div className="card-brand">
          <span className="card-brand-name">{brandLbl}</span>
          <span className="card-brand-sep">/</span>
          <span className="card-brand-code">{drink.can.code}</span>
        </div>
        <h3 className="card-name">{variant || drink.name}</h3>

        {drink.metrics && <MiniMetrics metrics={drink.metrics} />}

        <div className="card-foot">
          <div className="card-price">
            {drink.price != null ? (
              <>
                <span className="card-price-val">{drink.price.toFixed(2)}</span>
                <span className="card-price-cur">₽</span>
              </>
            ) : (
              <span className="card-price-val" style={{ color: 'var(--txt-quiet)', fontSize: '11px' }}>—</span>
            )}
          </div>
          <div className="card-rate">
            {drink.rating != null ? (
              <>
                <Icons.star w={12} />
                <span>{drink.rating.toFixed(1)}</span>
                <span className="card-rev">· {drink.reviewCount}</span>
              </>
            ) : (
              <span className="card-rev" style={{ color: 'var(--accent)' }}>Оцените первым</span>
            )}
          </div>
        </div>
      </div>

      <div
        className="card-hover-line"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${blend},0.9), transparent)` }}
      />
    </Link>
  )
}
