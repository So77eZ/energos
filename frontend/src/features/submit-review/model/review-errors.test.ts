import { describe, expect, it } from 'vitest'
import { ApiError } from '@shared/api/http'
import { localizeReviewError } from './review-errors'

describe('localizeReviewError', () => {
  it('код REVIEW_ALREADY_EXISTS → русское сообщение независимо от текста', () => {
    expect(localizeReviewError(new ApiError(409, 'any text', 'REVIEW_ALREADY_EXISTS'), 'x')).toMatch(/уже оставили отзыв/)
  })

  it('код VERIFIED_USER_REQUIRED → просьба подтвердить e-mail', () => {
    expect(localizeReviewError(new ApiError(403, 'Verified user required', 'VERIFIED_USER_REQUIRED'), 'x')).toMatch(/Подтвердите e-mail/)
  })

  it('409 без кода (старый бэк) → тоже «уже оставили отзыв»', () => {
    expect(localizeReviewError(new ApiError(409, 'Conflict'), 'x')).toMatch(/уже оставили отзыв/)
  })

  it('неизвестный код — текст бэка как есть', () => {
    expect(localizeReviewError(new ApiError(400, 'Something', 'BAD_REQUEST'), 'x')).toBe('Something')
  })

  it('обычная ошибка — её сообщение, пустая или не Error — fallback', () => {
    expect(localizeReviewError(new Error('Сеть недоступна'), 'x')).toBe('Сеть недоступна')
    expect(localizeReviewError(new Error(''), 'Ошибка сохранения')).toBe('Ошибка сохранения')
    expect(localizeReviewError('что-то', 'Ошибка сохранения')).toBe('Ошибка сохранения')
  })
})
