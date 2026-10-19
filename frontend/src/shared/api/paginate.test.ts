import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllPages, PAGE_SIZE } from './paginate'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const items = (from: number, n: number) => Array.from({ length: n }, (_, i) => ({ id: from + i }))
const urls = (fetchMock: ReturnType<typeof vi.fn>) => fetchMock.mock.calls.map((c) => String(c[0]))

afterEach(() => vi.unstubAllGlobals())

describe('fetchAllPages', () => {
  it('идёт по страницам, пока не придёт короткая', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(items(0, PAGE_SIZE)))
      .mockResolvedValueOnce(json(items(PAGE_SIZE, 1)))
    vi.stubGlobal('fetch', fetchMock)

    const all = await fetchAllPages<{ id: number }>('/api/v1/reviews/')

    expect(all).toHaveLength(PAGE_SIZE + 1)
    expect(urls(fetchMock)[0]).toContain(`/api/v1/reviews/?limit=${PAGE_SIZE}&offset=0`)
    expect(urls(fetchMock)[1]).toContain(`?limit=${PAGE_SIZE}&offset=${PAGE_SIZE}`)
  })

  it('одна короткая страница — один запрос', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/')).toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('путь уже со строкой запроса — параметры через &', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([]))
    vi.stubGlobal('fetch', fetchMock)

    await fetchAllPages('/api/v1/reviews/?energy_drink_id=7')

    expect(urls(fetchMock)[0]).toContain(`/api/v1/reviews/?energy_drink_id=7&limit=${PAGE_SIZE}&offset=0`)
  })
})
