import { afterEach, describe, expect, it, vi } from 'vitest'
import { drinkApi } from './drinkApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

afterEach(() => vi.unstubAllGlobals())

describe('drinkApi.list', () => {
  it('created_at из API приводится к UTC; без него — null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) =>
      String(url).includes('/count')
        ? json({ count: 2 })
        : json([
            { id: 1, name: 'A', price: 10, no_sugar: false, created_at: '2026-10-10T12:59:25.267857' },
            { id: 2, name: 'B', price: null, no_sugar: true },
          ])))

    const [a, b] = await drinkApi.list()

    expect(a.created_at).toBe('2026-10-10T12:59:25.267857Z')
    expect(Date.parse(a.created_at!)).toBe(Date.UTC(2026, 9, 10, 12, 59, 25, 267))
    expect(b.created_at).toBeNull()
    expect(a.image_url).toContain('/1/image')
  })

  it('число страниц берёт из /energy-drinks/count', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) =>
      String(url).includes('/count') ? json({ count: 0 }) : json([]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await drinkApi.list()).toEqual([])
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/energy-drinks/count')
  })
})
