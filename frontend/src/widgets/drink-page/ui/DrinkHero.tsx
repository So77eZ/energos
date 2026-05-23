'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { cleanDrinkName, EnergyCan, splitDrinkBrand, TierBadge } from '@entities/drink'
import type { EnrichedDrink } from '@entities/drink'
import { HexRadar } from '@entities/review'

interface DrinkHeroProps {
  drink: EnrichedDrink
  loggedIn: boolean
  hasMyReview: boolean
  onWriteReview: () => void
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)))
}

export function DrinkHero({ drink, loggedIn, hasMyReview, onWriteReview }: DrinkHeroProps) {
  const cleaned = cleanDrinkName(drink.name)
  const { brand, variant } = splitDrinkBrand(cleaned)
  const blend = drink.blend
  const style: CSSProperties & { '--blend'?: string } = { '--blend': blend }
  const updatedDays = daysSince(drink.updated_at ?? drink.created_at)

  return (
    <section className="drink-hero" style={style}>
      <div className="drink-hero-vis">
        {drink.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={drink.image_url} alt={drink.name} style={{ maxHeight: 480, width: 'auto' }} />
        ) : (
          <EnergyCan can={drink.can} w={220} h={500} />
        )}
        <div className="drink-hero-code">
          <span>{brand}</span>
          {updatedDays != null && (
            <>
              <span className="dot" />
              <span>{updatedDays}d</span>
            </>
          )}
        </div>
      </div>

      <div className="drink-hero-info">
        <div className="drink-tags">
          {drink.tier && <TierBadge tier={drink.tier} size="md" />}
          {drink.isNew && <span className="tag tag-cyan">NEW</span>}
          {drink.no_sugar && (
            <span className="tag tag-lime">
              <Icons.candyOff /> Без сахара
            </span>
          )}
          <span className="tag tag-ghost">{drink.reviewCount} отзывов</span>
        </div>
        <div className="drink-brand">{brand}</div>
        <h1 className="drink-name">{variant}</h1>

        <div className="drink-meta">
          <div className="meta-cell">
            <div className="meta-lbl">РЕЙТИНГ</div>
            <div className="meta-val meta-pink">
              <Icons.star />
              {drink.rating != null ? drink.rating.toFixed(1) : '—'}
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
            <div className="meta-lbl">ОТЗЫВОВ</div>
            <div className="meta-val meta-cyan">
              <Icons.msg /> {drink.reviewCount}
            </div>
          </div>
          <div className="meta-cell">
            <div className="meta-lbl">ОБНОВЛЁН</div>
            <div className="meta-val meta-lime">
              {updatedDays != null ? `${updatedDays}d` : '—'}
            </div>
          </div>
        </div>

        <div className="drink-cta-row">
          {loggedIn ? (
            <button type="button" className="cta-primary" onClick={onWriteReview}>
              {hasMyReview ? (
                <>
                  <Icons.edit /> Изменить мой отзыв
                </>
              ) : (
                <>
                  <Icons.plus /> Оставить отзыв
                </>
              )}
            </button>
          ) : (
            <Link href={ROUTES.auth.login} className="cta-primary">
              <Icons.lock /> Войти, чтобы оценить
            </Link>
          )}
          <Link href={ROUTES.compare([drink.id])} className="cta-ghost">
            <Icons.scale /> Сравнить
          </Link>
          <Link href={ROUTES.tasteMap} className="cta-ghost">
            <Icons.map /> На карте
          </Link>
        </div>
      </div>

      {drink.metrics && (
        <div className="drink-hero-radar">
          <div className="radar-header">
            <span className="radar-title">ВКУСОВОЙ ПРОФИЛЬ</span>
          </div>
          <HexRadar metrics={drink.metrics} size={260} />
        </div>
      )}
    </section>
  )
}
