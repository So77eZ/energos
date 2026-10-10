import { afterEach, describe, expect, it, vi } from 'vitest'
import { reviewApi } from './reviewApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const scores = { acidity: 3, sweetness: 4, carbonation: 5, concentration: 2, aftertaste: 3, price_quality: 4 }

afterEach(() => vi.unstubAllGlobals())

describe('reviewApi', () => {
  it('list: собирает отзывы из вложенных в напитки, id уникальны и отрицательны', async () => {
    const drinks = [
      { id: 1, reviews: [{ ...scores, overall: 3.5 }, { ...scores, overall: 4 }] },
      { id: 2, reviews: [{ ...scores, overall: 5 }] },
    ]
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      String(url).includes('/count') ? json({ count: drinks.length }) : json(drinks)))

    const reviews = await reviewApi.list()

    expect(reviews.map((r) => r.energy_drink_id)).toEqual([1, 1, 2])
    const ids = reviews.map((r) => r.id)
    expect(new Set(ids).size).toBe(3)
    expect(ids.every((id) => id < 0)).toBe(true)
    expect(reviews[0]).toMatchObject({ user_id: null, username: null, from_admin: false, comment: null })
  })

  it('byDrink: отзывы только нужного напитка, неизвестный напиток → []', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json([
      { id: 7, reviews: [{ ...scores, overall: 3.5 }] },
    ])))

    expect(await reviewApi.byDrink(7)).toHaveLength(1)
    expect(await reviewApi.byDrink(8)).toEqual([])
  })

  it('create: POST /reviews/{drink_id}, overall = среднее шести оценок, пустой comment не шлётся', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 42, ...scores, overall: 3.5 }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const created = await reviewApi.create(7, { ...scores, comment: '  ' }, 'tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/7')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toEqual({ ...scores, overall: 3.5 })
    expect(created).toMatchObject({ id: 42, energy_drink_id: 7 })
  })

  it('create: непустой comment уходит в тело', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 1, ...scores, overall: 3.5 }, 201))
    vi.stubGlobal('fetch', fetchMock)

    await reviewApi.create(1, { ...scores, comment: 'огонь' }, 'tok')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).comment).toBe('огонь')
  })

  it('remove: 204 без тела не падает', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(reviewApi.remove(5, 'tok')).resolves.toBeUndefined()
  })
})
