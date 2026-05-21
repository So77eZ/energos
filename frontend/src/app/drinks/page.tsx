import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'
import { authApi } from '@entities/user'
import { DrinkPage } from '@widgets/drink-page/ui/DrinkPage'

export const metadata = { title: 'Отзывы — Energos' }

interface Props {
  searchParams: Promise<{ id?: string; review?: string }>
}

export default async function DrinkRoute({ searchParams }: Props) {
  const { id, review } = await searchParams
  const [drinks, token] = await Promise.all([
    drinkApi.list().catch(() => []),
    getToken(),
  ])

  const activeDrink =
    (id ? drinks.find((d) => String(d.id) === id) : null) ?? drinks[0] ?? null

  if (!activeDrink) {
    return (
      <div className="empty">
        <p>Не удалось загрузить напитки. Проверьте подключение к API.</p>
      </div>
    )
  }

  const [reviews, currentUser] = await Promise.all([
    reviewApi.byDrink(activeDrink.id).catch(() => []),
    token ? authApi.me(token).catch(() => null) : Promise.resolve(null),
  ])

  const myReview = currentUser
    ? (reviews.find((r) => r.user_id === currentUser.id) ?? null)
    : null

  return (
    <DrinkPage
      drinks={drinks}
      activeDrink={activeDrink}
      initialReviews={reviews}
      currentUser={currentUser}
      myReview={myReview}
      autoOpenReview={review === '1'}
    />
  )
}
