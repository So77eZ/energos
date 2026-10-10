import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGachaponPool } from './actions'

const api = vi.hoisted(() => ({ drinks: vi.fn(), reviews: vi.fn() }))
vi.mock('@entities/drink', () => ({ drinkApi: { list: api.drinks } }))
vi.mock('@entities/review', () => ({ reviewApi: { list: api.reviews } }))

describe('fetchGachaponPool', () => {
  beforeEach(() => {
    api.drinks.mockReset()
    api.reviews.mockReset()
  })

  it('отдаёт напитки и отзывы одним ответом', async () => {
    api.drinks.mockResolvedValue([{ id: 1 }, { id: 2 }])
    api.reviews.mockResolvedValue([{ id: -10001, energy_drink_id: 1 }])

    await expect(fetchGachaponPool()).resolves.toEqual({
      drinks: [{ id: 1 }, { id: 2 }],
      reviews: [{ id: -10001, energy_drink_id: 1 }],
    })
  })

  it('грузит оба списка параллельно', async () => {
    let started = 0
    const slow = (v: unknown) => async () => {
      started++
      await new Promise((r) => setTimeout(r, 5))
      return v
    }
    api.drinks.mockImplementation(slow([]))
    api.reviews.mockImplementation(slow([]))

    const pending = fetchGachaponPool()
    await Promise.resolve()
    expect(started).toBe(2)
    await pending
  })

  it('ошибка бэка пробрасывается — провайдер покажет состояние «ошибка»', async () => {
    api.drinks.mockRejectedValue(new Error('boom'))
    api.reviews.mockResolvedValue([])

    await expect(fetchGachaponPool()).rejects.toThrow('boom')
  })
})
