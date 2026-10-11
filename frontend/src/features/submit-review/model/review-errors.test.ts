import { describe, expect, it } from 'vitest'
import { localizeReviewError } from './review-errors'

describe('localizeReviewError', () => {
  it('409 «уже оставил отзыв» → русское сообщение', () => {
    expect(localizeReviewError('User has already submitted a review for this energy drink', 'x')).toMatch(/уже оставили отзыв/)
  })

  it('старый 403 про один отзыв тоже переводится', () => {
    expect(localizeReviewError('Only one review per user is allowed for each energy drink', 'x')).toMatch(/уже оставили отзыв/)
  })

  it('неподтверждённый e-mail', () => {
    expect(localizeReviewError('User is not verified', 'x')).toMatch(/Подтвердите e-mail/)
  })

  it('неизвестное — как есть, пустое — fallback', () => {
    expect(localizeReviewError('Что-то ещё', 'x')).toBe('Что-то ещё')
    expect(localizeReviewError('', 'Ошибка сохранения')).toBe('Ошибка сохранения')
  })
})
