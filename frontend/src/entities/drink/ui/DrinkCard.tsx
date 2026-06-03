'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CSSProperties, MouseEvent } from 'react'
import { ROUTES } from '@shared/config/routes'
import { useFavorites } from '@shared/lib/favorites'
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
}

export function DrinkCard({ drink, rank = null, brand }: DrinkCardProps) {
  const cleaned = cleanDrinkName(drink.name)
  const split = brand
    ? { brand: brand.toUpperCase(), variant: cleaned }
    : splitDrinkBrand(cleaned)
  const blend = drink.blend
  const style: CSSProperties & { '--blend'?: string } = { '--blend': blend }

  // Состояние избранного теперь полностью в провайдере (знает userId и держит API-state).
  // Для гостей toggle сам выдаст info-toast — нам тут ничего проверять не надо.
  const { toggle, isFavorite } = useFavorites()
  const isFav = isFavorite(drink.id)
  const router = useRouter()

  function onFavClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    void toggle(drink.id, drink.name)
  }

  // Карточка — <Link> на напиток; кнопка сравнения уводит на /compare, поэтому
  // гасим переход по карточке (preventDefault) и всплытие, навигируем вручную.
  function onCompareClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(ROUTES.compare([drink.id]))
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
          <div className="card-foot-right">
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
            <button
              type="button"
              className="card-compare"
              onClick={onCompareClick}
              aria-label={`Сравнить «${drink.name}»`}
              title="Добавить в сравнение"
            >
              <Icons.scale w={14} />
            </button>
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
