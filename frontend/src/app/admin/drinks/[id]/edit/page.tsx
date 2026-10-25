import { redirect, notFound } from 'next/navigation'
import { drinkApi } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'
import { DrinkForm } from '@features/drink-form/ui/DrinkForm'
import { updateDrinkAction } from '@features/drink-form/model/actions'
import { ROUTES } from '@shared/config/routes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditDrinkPage({ params }: Props) {
  const { id } = await params
  const token = await getToken()
  if (!token) redirect(ROUTES.auth.login)

  const drinkId = Number(id)
  const [drink, reviews] = await Promise.all([
    drinkApi.get(drinkId).catch(() => null),
    reviewApi.byDrink(drinkId).catch(() => []),
  ])

  if (!drink) notFound()

  const adminReview = reviews.find((r) => r.from_admin) ?? null

  const boundAction = updateDrinkAction.bind(null, drinkId)

  return <DrinkForm mode="edit" drink={drink} adminReview={adminReview} action={boundAction} />
}
