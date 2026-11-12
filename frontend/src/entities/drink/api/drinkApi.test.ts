import { afterEach, describe, expect, it, vi } from 'vitest'
import { drinkApi } from './drinkApi'
import { type ApiError, RateLimitError, SessionExpiredError } from '@shared/api/http'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })

afterEach(() => vi.unstubAllGlobals())

describe('drinkApi.uploadImage', () => {
  const file = () => new File(['image'], 'can.webp', { type: 'image/webp' })

  it('accepts a successful WebP response without parsing it as JSON', async () => {
    const response = new Response(new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]), {
      headers: { 'Content-Type': 'image/webp' },
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    await expect(drinkApi.uploadImage(1, file(), 'token')).resolves.toBeUndefined()
  })

  it('also accepts the old JSON response during a rolling update', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ id: 1, name: 'A', price: 1, no_sugar: false })))

    await expect(drinkApi.uploadImage(1, file(), 'token')).resolves.toBeUndefined()
  })

  it.each([
    [401, SessionExpiredError],
    [429, RateLimitError],
  ])('preserves authentication and rate-limit errors for HTTP %s', async (status, error) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, status)))

    await expect(drinkApi.uploadImage(1, file(), 'token')).rejects.toBeInstanceOf(error)
  })

  it('preserves backend validation details and error codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      error: { code: 'INVALID_IMAGE', message: 'Unsupported image type' },
    }, 400)))

    await expect(drinkApi.uploadImage(1, file(), 'token')).rejects.toMatchObject({
      status: 400, code: 'INVALID_IMAGE', message: 'Unsupported image type',
    } satisfies Partial<ApiError>)
  })
})

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
