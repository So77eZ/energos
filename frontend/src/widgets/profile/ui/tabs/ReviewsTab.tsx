'use client'

import { useRouter } from 'next/navigation'
import type { Drink, EnrichedDrink } from '@entities/drink'
import { cleanDrinkName, EnergyCan } from '@entities/drink'
import type { Review } from '@entities/review'
import { calcRating, MiniMetrics } from '@entities/review'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { ProfileEmpty } from './ProfileEmpty'

interface ReviewsTabProps {
  reviews: Review[]
  drinkMap: Map<number, Drink>
  enrichedMap: Map<number, EnrichedDrink>
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function ReviewsTab({ reviews, drinkMap, enrichedMap }: ReviewsTabProps) {
  const router = useRouter()

  if (reviews.length === 0) {
    return (
      <ProfileEmpty
        icon={<Icons.msg w={36} />}
        title="Пока нет отзывов"
        body="Найди напиток в каталоге и оцени его."
        cta="К каталогу"
        href={ROUTES.home}
      />
    )
  }

  return (
    <section className="prof-section">
      <div className="prof-rev-list">
        {reviews.map((r) => {
          const drink = drinkMap.get(r.energy_drink_id)
          const enriched = enrichedMap.get(r.energy_drink_id)
          const cleanedName = drink ? cleanDrinkName(drink.name) : `Напиток #${r.energy_drink_id}`
          const openDrink = () => router.push(ROUTES.reviews(r.energy_drink_id))
          const openEdit = (e: React.MouseEvent) => {
            e.stopPropagation()
            router.push(`${ROUTES.reviews(r.energy_drink_id)}&review=1`)
          }
          return (
            <div
              key={r.id}
              className="prof-rev"
              role="link"
              tabIndex={0}
              onClick={openDrink}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDrink()}
              style={{ cursor: 'pointer' }}
            >
              <div className="prof-rev-can">
                {drink?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={drink.image_url} alt={drink.name} style={{ maxHeight: 108, width: 'auto', objectFit: 'contain' }} />
                ) : enriched ? (
                  <EnergyCan can={enriched.can} w={50} h={108} />
                ) : null}
              </div>
              <div className="prof-rev-info">
                <div className="prof-rev-name">{cleanedName}</div>
                <div className="prof-rev-meta">
                  <span>{formatDate(r.updated_at ?? r.created_at)}</span>
                  <span>·</span>
                  <Icons.star w={10} /> {calcRating(r).toFixed(1)}
                </div>
                {r.comment && <p className="prof-rev-comment">«{r.comment}»</p>}
              </div>
              <div className="prof-rev-metrics">
                <MiniMetrics metrics={r} />
              </div>
              <button
                type="button"
                className="prof-rev-edit"
                aria-label="Изменить отзыв"
                onClick={openEdit}
              >
                <Icons.edit />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
