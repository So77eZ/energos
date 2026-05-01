import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'
import { authApi } from '@entities/user'
import { ReviewsPage } from '@widgets/reviews-page/ui/ReviewsPage'

export const metadata = { title: 'Отзывы — Energos' }
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function ReviewsRoute({ searchParams }: Props) {
  const { id } = await searchParams
  const [drinks, token] = await Promise.all([
    drinkApi.list().catch(() => []),
    getToken(),
  ])

  const activeDrink =
    (id ? drinks.find((d) => String(d.id) === id) : null) ?? drinks[0] ?? null

  const [reviews, currentUser] = await Promise.all([
    activeDrink ? reviewApi.byDrink(activeDrink.id).catch(() => []) : Promise.resolve([]),
    token ? authApi.me(token).catch(() => null) : Promise.resolve(null),
  ])

  const myReview = currentUser
    ? (reviews.find((r) => !r.from_admin && r.user_id === currentUser.id) ?? null)
    : null

  return (
    <ReviewsPage
      drinks={drinks}
      activeDrink={activeDrink}
      initialReviews={reviews}
      currentUser={currentUser}
      myReview={myReview}
    />
  )
}
