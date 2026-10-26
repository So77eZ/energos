import { afterEach, describe, expect, it, vi } from 'vitest'
import { drinkApi } from './drinkApi'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

afterEach(() => vi.unstubAllGlobals())

describe('drinkApi.list', () => {
  it('created_at из API приводится к UTC; без него — null', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json([
      { id: 1, name: 'A', price: 10, no_sugar: false, created_at: '2026-10-10T12:59:25.267857' },
      { id: 2, name: 'B', price: null, no_sugar: true },
    ])))

    const [a, b] = await drinkApi.list()

    expect(a.created_at).toBe('2026-10-10T12:59:25.267857Z')
    expect(Date.parse(a.created_at!)).toBe(Date.UTC(2026, 9, 10, 12, 59, 25, 267))
    expect(b.created_at).toBeNull()
    // Картинки отдаёт фронт (#320): браузер до `/api` в проде не достаёт.
    expect(a.image_url).toBe('/drink-image/1')
  })

  it('updated_at — версия картинки в адресе; без него — адрес без версии', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => json([
      { id: 1, name: 'A', price: 10, no_sugar: false, updated_at: '2026-10-26T20:00:00Z' },
      { id: 2, name: 'B', price: 10, no_sugar: false, updated_at: 'мусор' },
    ])))

    const [a, b] = await drinkApi.list()

    expect(a.image_url).toBe(`/drink-image/1?v=${Date.UTC(2026, 9, 26, 20)}`)
    expect(a.updated_at).toBe('2026-10-26T20:00:00Z')
    expect(b.image_url).toBe('/drink-image/2')
  })

  it('весь каталог одним запросом, без limit/offset и /count', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => json([{ id: 1, name: 'A', price: 1, no_sugar: false }]))
    vi.stubGlobal('fetch', fetchMock)

    expect(await drinkApi.list()).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/v1\/energy-drinks\/$/)
  })
})
