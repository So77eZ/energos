import { afterEach, describe, expect, it, vi } from 'vitest'
import { reviewApi } from './reviewApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const scores = { acidity: 3, sweetness: 4, carbonation: 5, concentration: 2, aftertaste: 3, price_quality: 4 }
const user = { id: 9, username: 'NeonFox', role: 'user' }

afterEach(() => vi.unstubAllGlobals())

describe('reviewApi', () => {
  it('byDrink: GET /reviews/?energy_drink_id=…, автор и комментарий берутся из ответа', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([
      { id: 1, ...scores, rating: 4, comment: 'огонь', user, created_at: '2026-10-17T12:50:45.178703Z' },
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
    // дата — как пришла с бэка (ISO с зоной); если её нет в ответе — null
    expect(reviews[0].created_at).toBe('2026-10-17T12:50:45.178703Z')
    expect(reviews[1].created_at).toBeNull()
  })

  it('byDrink: отзыв автора с ролью admin помечается from_admin', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json([
      { id: 1, ...scores, rating: 5, comment: null, user: { id: 1, username: 'Editor', role: 'admin' } },
      { id: 2, ...scores, rating: 3, comment: null, user },
    ])))

    const reviews = await reviewApi.byDrink(7)

    expect(reviews.map((r) => r.from_admin)).toEqual([true, false])
  })

  it('create: POST /reviews/{drink_id}, rating — выбор пользователя (не среднее метрик), пустой comment не шлётся', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 42, ...scores, rating: 5, comment: null, user }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const created = await reviewApi.create(7, { ...scores, rating: 5, comment: '  ' }, 'tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/7')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok')
    // метрики в среднем дают 3.5, но rating — то, что выбрал пользователь
    expect(JSON.parse(init.body)).toEqual({ ...scores, rating: 5 })
    expect(created).toMatchObject({ id: 42, energy_drink_id: 7, rating: 5, user_id: 9 })
  })

  it('create: rating всегда целое в диапазоне 1–5', async () => {
    // Новый Response на каждый вызов: тело читается один раз.
    const fetchMock = vi.fn().mockImplementation(async () => json({ id: 1, ...scores, rating: 1, comment: null, user }, 201))
    vi.stubGlobal('fetch', fetchMock)

    await reviewApi.create(1, { ...scores, rating: 0 }, 'tok')
    await reviewApi.create(1, { ...scores, rating: 9 }, 'tok')
    await reviewApi.create(1, { ...scores, rating: 3.6 }, 'tok')

    const sent = fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).rating)
    expect(sent).toEqual([1, 5, 4])
  })

  it('create: непустой comment уходит в тело', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 1, ...scores, rating: 4, comment: 'огонь', user }, 201))
    vi.stubGlobal('fetch', fetchMock)

    await reviewApi.create(1, { ...scores, rating: 4, comment: 'огонь' }, 'tok')

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).comment).toBe('огонь')
  })

  it('update: PUT /reviews/{id} с rating и comment', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ id: 5, ...scores, rating: 2, comment: 'ок', user }))
    vi.stubGlobal('fetch', fetchMock)

    const updated = await reviewApi.update(5, 7, { ...scores, rating: 2, comment: 'ок' }, 'tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/5')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body)).toEqual({ ...scores, rating: 2, comment: 'ок' })
    expect(updated).toMatchObject({ id: 5, energy_drink_id: 7, rating: 2 })
  })

  it('myReviews: GET /reviews/me с токеном, напиток берётся из energy_drink', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([
      { id: 3, ...scores, rating: 4, comment: 'ок', energy_drink: { id: 12, name: 'X' },
        created_at: '2026-10-19T10:00:00Z', updated_at: '2026-10-19T11:00:00Z' },
    ]))
    vi.stubGlobal('fetch', fetchMock)

    const [r] = await reviewApi.myReviews('tok')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/reviews/me?limit=')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(r).toMatchObject({ id: 3, energy_drink_id: 12, rating: 4, comment: 'ок',
      created_at: '2026-10-19T10:00:00Z', updated_at: '2026-10-19T11:00:00Z' })
  })

  it('remove: 204 без тела не падает', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(reviewApi.remove(5, 'tok')).resolves.toBeUndefined()
  })
})
