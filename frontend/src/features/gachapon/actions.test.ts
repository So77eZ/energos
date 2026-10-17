import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchGachaponPool } from './actions'

const api = vi.hoisted(() => ({ drinks: vi.fn() }))
vi.mock('@entities/drink', () => ({ drinkApi: { list: api.drinks } }))

describe('fetchGachaponPool', () => {
  beforeEach(() => {
    api.drinks.mockReset()
  })

  it('отдаёт напитки (рейтинги уже внутри drink.stats)', async () => {
    api.drinks.mockResolvedValue([{ id: 1 }, { id: 2 }])

    await expect(fetchGachaponPool()).resolves.toEqual([{ id: 1 }, { id: 2 }])
  })

  it('ошибка бэка пробрасывается — провайдер покажет состояние «ошибка»', async () => {
    api.drinks.mockRejectedValue(new Error('boom'))

    await expect(fetchGachaponPool()).rejects.toThrow('boom')
  })
})
