import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllPages } from './paginate'

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })

afterEach(() => vi.unstubAllGlobals())

describe('fetchAllPages', () => {
  it('идёт по страницам, пока не придёт короткая', async () => {
    const full = Array.from({ length: 100 }, (_, i) => ({ id: i }))
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(full))
      .mockResolvedValueOnce(json([{ id: 100 }]))
    vi.stubGlobal('fetch', fetchMock)

    const all = await fetchAllPages<{ id: number }>('/api/v1/energy-drinks/')

    expect(all).toHaveLength(101)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/energy-drinks/?limit=100&offset=0')
    expect(fetchMock.mock.calls[1][0]).toContain('?limit=100&offset=100')
  })

  it('одна короткая страница — один запрос', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/')).toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
