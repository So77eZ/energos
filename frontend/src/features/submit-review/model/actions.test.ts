import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@shared/api/http'
import { saveReviewAction } from './actions'

const m = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  getToken: vi.fn(),
  updateTag: vi.fn(),
  redirect: vi.fn(),
}))
vi.mock('@entities/review', async () => ({
  ...await import('@entities/review/model/types'),
  reviewApi: { create: m.create, update: m.update },
}))
vi.mock('@shared/lib/session', () => ({ getToken: m.getToken }))
vi.mock('@shared/lib/auth-guard', () => ({ redirectIfSessionExpired: vi.fn() }))
vi.mock('next/cache', () => ({ updateTag: m.updateTag }))
vi.mock('next/navigation', () => ({ redirect: m.redirect }))

function validForm() {
  const form = new FormData()
  Object.entries({
    drink_id: '42', rating: '5', acidity: '1', sweetness: '2', carbonation: '3',
    concentration: '4', aftertaste: '5', price_quality: '1', comment: 'Вкусно',
  }).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('saveReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.getToken.mockResolvedValue('token')
    m.create.mockResolvedValue(undefined)
    m.update.mockResolvedValue(undefined)
    m.redirect.mockImplementation((url: string) => { throw new Error(`redirect:${url}`) })
  })

  it.each([
    ['rating', null, 'Общая оценка'],
    ['acidity', '', 'Кислотность'],
    ['sweetness', ' ', 'Сладость'],
    ['carbonation', 'NaN', 'Газированность'],
    ['concentration', '2.5', 'Концентрация'],
    ['aftertaste', '0', 'Послевкусие'],
    ['price_quality', '6', 'Цена/качество'],
    ['rating', 'Infinity', 'Общая оценка'],
  ])('отклоняет некорректную оценку %s=%j до сохранения', async (key, value, label) => {
    const form = validForm()
    if (value === null) form.delete(key)
    else form.set(key, value)

    const result = await saveReviewAction(null, form)

    expect(result?.error).toContain(label)
    expect(m.create).not.toHaveBeenCalled()
    expect(m.update).not.toHaveBeenCalled()
    expect(m.updateTag).not.toHaveBeenCalled()
    expect(m.redirect).not.toHaveBeenCalled()
  })

  it('перечисляет все пропущенные оценки и не сохраняет редактируемый отзыв', async () => {
    const form = validForm()
    form.set('review_id', '17')
    form.delete('rating')
    form.delete('sweetness')
    form.delete('price_quality')

    const result = await saveReviewAction(null, form)

    expect(result?.error).toContain('Общая оценка')
    expect(result?.error).toContain('Сладость')
    expect(result?.error).toContain('Цена/качество')
    expect(result?.error).not.toContain('Кислотность')
    expect(m.update).not.toHaveBeenCalled()
  })

  it('сохраняет все семь выбранных оценок без подмены и обновляет отзывы', async () => {
    await expect(saveReviewAction(null, validForm())).rejects.toThrow('redirect:/drinks?id=42')

    expect(m.create).toHaveBeenCalledWith(42, {
      rating: 5, acidity: 1, sweetness: 2, carbonation: 3,
      concentration: 4, aftertaste: 5, price_quality: 1, comment: 'Вкусно',
    }, 'token')
    expect(m.update).not.toHaveBeenCalled()
    expect(m.updateTag).toHaveBeenCalledWith('reviews')
  })

  it('сохраняет изменения существующего отзыва, включая удаление комментария', async () => {
    const form = validForm()
    form.set('review_id', '17')
    form.set('comment', '')

    await expect(saveReviewAction(null, form)).rejects.toThrow('redirect:/drinks?id=42')

    expect(m.update).toHaveBeenCalledWith(17, 42, {
      rating: 5, acidity: 1, sweetness: 2, carbonation: 3,
      concentration: 4, aftertaste: 5, price_quality: 1, comment: null,
    }, 'token')
    expect(m.create).not.toHaveBeenCalled()
  })

  it('сохраняет локализацию ошибки API и не сбрасывает кеш при ошибке', async () => {
    m.create.mockRejectedValue(new ApiError(409, 'Conflict', 'REVIEW_ALREADY_EXISTS'))

    const result = await saveReviewAction(null, validForm())

    expect(result?.error).toMatch(/уже оставили отзыв/)
    expect(m.updateTag).not.toHaveBeenCalled()
  })
})
