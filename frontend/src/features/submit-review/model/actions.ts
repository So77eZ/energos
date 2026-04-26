'use server'

import { redirect } from 'next/navigation'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'

const getNum = (formData: FormData, name: string) => {
  const v = Number(formData.get(name))
  return isNaN(v) ? 3 : Math.min(5, Math.max(1, Math.round(v)))
}

export async function saveReviewAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const token = await getToken()
  if (!token) redirect('/auth/login')

  const drinkId = Number(formData.get('drink_id'))
  if (!drinkId) return { error: 'Не указан напиток' }

  const reviewIdRaw = formData.get('review_id')
  const reviewId = reviewIdRaw ? Number(reviewIdRaw) : null

  const payload = {
    rating:        getNum(formData, 'rating'),
    acidity:       getNum(formData, 'acidity'),
    sweetness:     getNum(formData, 'sweetness'),
    concentration: getNum(formData, 'concentration'),
    carbonation:   getNum(formData, 'carbonation'),
    aftertaste:    getNum(formData, 'aftertaste'),
    price_quality: getNum(formData, 'price_quality'),
    comment:       formData.get('comment')?.toString() || null,
  }

  try {
    if (reviewId) {
      await reviewApi.update(reviewId, payload, token)
    } else {
      await reviewApi.create(
        { ...payload, energy_drink_id: drinkId, from_admin: false },
        token,
      )
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ошибка сохранения' }
  }

  redirect(`/reviews?id=${drinkId}`)
}

export async function deleteReviewAction(reviewId: number, drinkId: number): Promise<void> {
  const token = await getToken()
  if (!token) redirect('/auth/login')
  try {
    await reviewApi.remove(reviewId, token)
  } catch {
    // ignore
  }
  redirect(`/reviews?id=${drinkId}`)
}
