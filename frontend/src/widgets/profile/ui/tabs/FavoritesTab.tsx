'use client'

import { DrinkCard, type EnrichedDrink } from '@entities/drink'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { ProfileEmpty } from './ProfileEmpty'

interface FavoritesTabProps {
  favDrinks: EnrichedDrink[]
  userId: number
}

export function FavoritesTab({ favDrinks, userId }: FavoritesTabProps) {
  if (favDrinks.length === 0) {
    return (
      <ProfileEmpty
        icon={<Icons.bolt w={36} />}
        title="Пока ничего не отмечено"
        body="Нажми на молнию ⚡ на карточке напитка, чтобы добавить в избранное."
        cta="К каталогу"
        href={ROUTES.home}
      />
    )
  }
  return (
    <section className="prof-section">
      <div className="grid grid-regular">
        {favDrinks.map((d) => (
          <DrinkCard key={d.id} drink={d} userId={userId} />
        ))}
      </div>
    </section>
  )
}
