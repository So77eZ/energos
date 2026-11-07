'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { reviewApi } from '@entities/review'
import { getToken } from '@shared/lib/session'
import { RateLimitError } from '@shared/api/http'
import { redirectIfSessionExpired } from '@shared/lib/auth-guard'
import { localizeReviewError } from './review-errors'
import { getInvalidReviewScoreKeys, REVIEW_SCORE_LABELS } from './review-scores'

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
    rating:        Number(formData.get('rating')),
    acidity:       Number(formData.get('acidity')),
    sweetness:     Number(formData.get('sweetness')),
    concentration: Number(formData.get('concentration')),
    carbonation:   Number(formData.get('carbonation')),
    aftertaste:    Number(formData.get('aftertaste')),
    price_quality: Number(formData.get('price_quality')),
    comment:       formData.get('comment')?.toString() || null,
  }

  const invalidScores = getInvalidReviewScoreKeys(payload)
  if (invalidScores.length) {
    return { error: `Укажите целые оценки от 1 до 5: ${invalidScores.map((key) => REVIEW_SCORE_LABELS[key]).join(', ')}` }
  }

  try {
    if (reviewId) {
      await reviewApi.update(reviewId, drinkId, payload, token)
    } else {
      await reviewApi.create(drinkId, payload, token)
    }
  } catch (e) {
    await redirectIfSessionExpired(e) // 401 → clear+redirect; иначе вниз
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: localizeReviewError(e, 'Ошибка сохранения') }
  }

  updateTag('reviews')
  redirect(`/drinks?id=${drinkId}`)
}

export async function deleteReviewAction(
  reviewId: number,
  drinkId: number,
): Promise<{ error: string } | void> {
  const token = await getToken()
  if (!token) redirect('/auth/login')
  try {
    await reviewApi.remove(reviewId, token)
  } catch (e) {
    await redirectIfSessionExpired(e) // 401 → clear+redirect; иначе вниз
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: e instanceof Error ? e.message : 'Не удалось удалить отзыв' }
  }
  updateTag('reviews')
  redirect(`/drinks?id=${drinkId}`)
}
