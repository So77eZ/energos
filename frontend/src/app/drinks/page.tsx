import { notFound } from 'next/navigation'
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

  // id задан, но напитка с таким id нет → честная 404 (не молчаливый фоллбэк на первый).
  if (id) {
    const found = drinks.find((d) => String(d.id) === id)
    if (!found) notFound()
  }

  // Без id — индекс /drinks показывает первый напиток (намеренно).
  const activeDrink = (id ? drinks.find((d) => String(d.id) === id) : null) ?? drinks[0] ?? null

  if (!activeDrink) {
    return (
      <div className="empty">
        <p>Не удалось загрузить напитки. Проверьте подключение к API.</p>
      </div>
    )
  }

  const [allReviews, currentUser] = await Promise.all([
    reviewApi.list().catch(() => []),
    token ? authApi.me(token).catch(() => null) : Promise.resolve(null),
  ])

  const reviews = allReviews.filter((r) => r.energy_drink_id === activeDrink.id)
  const myReview = currentUser
    ? (reviews.find((r) => r.user_id === currentUser.id) ?? null)
    : null

  return (
    <DrinkPage
      drinks={drinks}
      activeDrink={activeDrink}
      initialReviews={reviews}
      allReviews={allReviews}
      currentUser={currentUser}
      myReview={myReview}
      autoOpenReview={review === '1'}
    />
  )
}
