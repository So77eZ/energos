import { afterEach, describe, expect, it, vi } from 'vitest'
import { reviewApi } from './reviewApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const scores = { acidity: 3, sweetness: 4, carbonation: 5, concentration: 2, aftertaste: 3, price_quality: 4 }
const user = { id: 9, username: 'NeonFox', role: 'user' }

afterEach(() => vi.unstubAllGlobals())

describe('reviewApi', () => {
  it('byDrink: GET /reviews/?energy_drink_id=…, автор и комментарий берутся из ответа', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([
      { id: 1, ...scores, rating: 4, comment: 'огонь', user },
      { id: 2, ...scores, rating: 3, comment: null, user: { ...user, id: 10, username: 'Other' } },
    ]))
    vi.stubGlobal('fetch', fetchMock)

    const reviews = await reviewApi.byDrink(7)

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('/api/v1/reviews/?energy_drink_id=7&limit=')
    expect(url.match(/\?/g)).toHaveLength(1)
    expect(reviews.map((r) => r.energy_drink_id)).toEqual([7, 7])
    expect(reviews[0]).toMatchObject({ id: 1, rating: 4, comment: 'огонь', user_id: 9, username: 'NeonFox', from_admin: false })
    expect(reviews[1]).toMatchObject({ user_id: 10, username: 'Other', comment: null })
  })

  it('create: POST /reviews/{drink_id}, rating — целое среднее шести оценок, пустой comment не шлётся', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 42, ...scores, rating: 4, comment: null, user }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const created = await reviewApi.create(7, { ...scores, comment: '  ' }, 'tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/7')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok')
    // (3+4+5+2+3+4)/6 = 3.5 → 4
    expect(JSON.parse(init.body)).toEqual({ ...scores, rating: 4 })
    expect(created).toMatchObject({ id: 42, energy_drink_id: 7, rating: 4, user_id: 9 })
  })

  it('create: rating всегда в диапазоне 1–5', async () => {
    // Новый Response на каждый вызов: тело читается один раз.
    const fetchMock = vi.fn().mockImplementation(async () => json({ id: 1, ...scores, rating: 1, comment: null, user }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const ones = { acidity: 1, sweetness: 1, carbonation: 1, concentration: 1, aftertaste: 1, price_quality: 1 }
    const fives = { acidity: 5, sweetness: 5, carbonation: 5, concentration: 5, aftertaste: 5, price_quality: 5 }

    await reviewApi.create(1, ones, 'tok')
    await reviewApi.create(1, fives, 'tok')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).rating).toBe(1)
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).rating).toBe(5)
  })

  it('create: непустой comment уходит в тело', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 1, ...scores, rating: 4, comment: 'огонь', user }, 201))
    vi.stubGlobal('fetch', fetchMock)

    await reviewApi.create(1, { ...scores, comment: 'огонь' }, 'tok')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).comment).toBe('огонь')
  })

  it('update: PUT /reviews/{id} с rating и comment', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 5, ...scores, rating: 4, comment: 'ок', user }))
    vi.stubGlobal('fetch', fetchMock)

    const updated = await reviewApi.update(5, 7, { ...scores, comment: 'ок' }, 'tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/5')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ ...scores, rating: 4, comment: 'ок' })
    expect(updated).toMatchObject({ id: 5, energy_drink_id: 7 })
  })

  it('remove: 204 без тела не падает', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(reviewApi.remove(5, 'tok')).resolves.toBeUndefined()
  })
})
