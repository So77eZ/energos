import { describe, expect, it } from 'vitest'
import { ApiError } from '@shared/api/http'
import { localizeReviewError } from './review-errors'

describe('localizeReviewError', () => {
  it('409 → русское сообщение независимо от текста detail', () => {
    expect(localizeReviewError(new ApiError(409, 'User has already submitted a review'), 'x')).toMatch(/уже оставили отзыв/)
    expect(localizeReviewError(new ApiError(409, 'Conflict'), 'x')).toMatch(/уже оставили отзыв/)
  })

  it('другие статусы — текст бэка как есть', () => {
    expect(localizeReviewError(new ApiError(403, 'User is not verified'), 'x')).toBe('User is not verified')
  })

  it('обычная ошибка — её сообщение, пустая или не Error — fallback', () => {
    expect(localizeReviewError(new Error('Сеть недоступна'), 'x')).toBe('Сеть недоступна')
    expect(localizeReviewError(new Error(''), 'Ошибка сохранения')).toBe('Ошибка сохранения')
    expect(localizeReviewError('что-то', 'Ошибка сохранения')).toBe('Ошибка сохранения')
  })
})
