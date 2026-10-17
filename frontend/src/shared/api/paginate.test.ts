import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAllPages, PAGE_SIZE } from './paginate'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const items = (from: number, n: number) => Array.from({ length: n }, (_, i) => ({ id: from + i }))
const urls = (fetchMock: ReturnType<typeof vi.fn>) => fetchMock.mock.calls.map((c) => String(c[0]))

afterEach(() => vi.unstubAllGlobals())

describe('fetchAllPages без счётчика', () => {
  it('идёт по страницам, пока не придёт короткая', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(items(0, PAGE_SIZE)))
      .mockResolvedValueOnce(json(items(PAGE_SIZE, 1)))
    vi.stubGlobal('fetch', fetchMock)

    const all = await fetchAllPages<{ id: number }>('/api/v1/energy-drinks/')

    expect(all).toHaveLength(PAGE_SIZE + 1)
    expect(urls(fetchMock)[0]).toContain(`/api/v1/energy-drinks/?limit=${PAGE_SIZE}&offset=0`)
    expect(urls(fetchMock)[1]).toContain(`?limit=${PAGE_SIZE}&offset=${PAGE_SIZE}`)
  })

  it('одна короткая страница — один запрос', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([{ id: 1 }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/')).toEqual([{ id: 1 }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('fetchAllPages со счётчиком (/count)', () => {
  const COUNT = '/x/count'

  it('число страниц считается по count, страницы грузятся без ожидания короткой', async () => {
    const total = PAGE_SIZE * 2 + 5
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/count')) return json({ count: total })
      const offset = Number(new URL(String(url), 'http://h').searchParams.get('offset'))
      return json(items(offset, Math.min(PAGE_SIZE, total - offset)))
    })
    vi.stubGlobal('fetch', fetchMock)

    const all = await fetchAllPages<{ id: number }>('/x/', undefined, COUNT)

    expect(all.map((d) => d.id)).toEqual(Array.from({ length: total }, (_, i) => i))
    expect(urls(fetchMock).filter((u) => u.includes('/count'))).toHaveLength(1)
    expect(urls(fetchMock).filter((u) => u.includes('?limit='))).toHaveLength(3)
  })

  it('страницы запрашиваются параллельно: все запросы стартуют до первого ответа', async () => {
    const total = PAGE_SIZE * 3
    let inflight = 0
    let maxInflight = 0
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/count')) return json({ count: total })
      inflight++
      maxInflight = Math.max(maxInflight, inflight)
      await new Promise((r) => setTimeout(r, 5))
      inflight--
      return json(items(0, PAGE_SIZE))
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchAllPages('/x/', undefined, COUNT)

    expect(maxInflight).toBe(3)
  })

  it('count = 0 → пусто, без запросов страниц', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ count: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/', undefined, COUNT)).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('счётчик недоступен (500) → запасной последовательный режим', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) =>
      String(url).includes('/count') ? json({ detail: 'boom' }, 500) : json(items(0, 3)))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/', undefined, COUNT)).toHaveLength(3)
  })

  it('счётчик вернул не то (массив вместо {count}) → запасной режим', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) =>
      String(url).includes('/count') ? json([1, 2]) : json(items(0, 2)))
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchAllPages('/x/', undefined, COUNT)).toHaveLength(2)
  })

  it('пока грузили, добавили записи: полная последняя страница → дочитывает по очереди', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/count')) return json({ count: PAGE_SIZE })
      const offset = Number(new URL(String(url), 'http://h').searchParams.get('offset'))
      return json(offset === 0 ? items(0, PAGE_SIZE) : items(offset, 2))
    })
    vi.stubGlobal('fetch', fetchMock)

    const all = await fetchAllPages<{ id: number }>('/x/', undefined, COUNT)

    expect(all).toHaveLength(PAGE_SIZE + 2)
  })
})
