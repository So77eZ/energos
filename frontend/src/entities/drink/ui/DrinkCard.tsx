'use client'

import Link from 'next/link'
import type { CSSProperties, MouseEvent } from 'react'
import { ROUTES } from '@shared/config/routes'
import { useFavorites } from '@shared/lib/favorites'
import { useToast } from '@shared/lib/toast'
import { Icons } from '@shared/ui/icons'
import { MiniMetrics } from '@entities/review'
import { EnergyCan } from './EnergyCan'
import { TierBadge } from './TierBadge'
import { cleanDrinkName, splitDrinkBrand } from '../lib/format'
import type { EnrichedDrink } from '../lib/enrich'

interface DrinkCardProps {
  drink: EnrichedDrink
  rank?: number | null
  /** Brand displayed before the variant name. Overrides the heuristic split. */
  brand?: string
  /** Current user id — enables the favorite-toggle button. */
  userId?: number | null
}

export function DrinkCard({ drink, rank = null, brand, userId = null }: DrinkCardProps) {
  const cleaned = cleanDrinkName(drink.name)
  const split = brand
    ? { brand: brand.toUpperCase(), variant: cleaned }
    : splitDrinkBrand(cleaned)
  const blend = drink.blend
  const style: CSSProperties & { '--blend'?: string } = { '--blend': blend }

  const { toggle, isFavorite } = useFavorites()
  const { toast } = useToast()
  const isFav = userId != null && isFavorite(userId, drink.id)

  function onFavClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (userId == null) {
      toast({ kind: 'info', msg: 'Войди, чтобы добавить в избранное' })
      return
    }
    toggle(userId, drink.id, split.variant || drink.name)
  }

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
          <button
            type="button"
            className={`card-fav${isFav ? ' is-fav' : ''}`}
            onClick={onFavClick}
            aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
            aria-pressed={isFav}
            title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Icons.bolt w={14} />
          </button>
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
          <span className="card-brand-name">{split.brand}</span>
        </div>
        <h3 className="card-name">{split.variant}</h3>

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
