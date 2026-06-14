import { describe, it, expect, vi, afterEach } from 'vitest'
import { favoritesApi } from './favoritesApi'
import { SessionExpiredError } from '@shared/api/http'

const stubFetch = (status: number) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status })))

afterEach(() => vi.unstubAllGlobals())

// requestNoBody идёт мимо httpRequest — без общего маппинга 401 «протух токен»
// при снятии/добавлении избранного молча уходил в generic Error (регресс).
describe('favoritesApi no-body — маппинг статусов', () => {
  it('remove на 401 → SessionExpiredError', async () => {
    stubFetch(401)
    await expect(favoritesApi.remove(1, 'tok')).rejects.toBeInstanceOf(SessionExpiredError)
  })
  it('add на 401 → SessionExpiredError', async () => {
    stubFetch(401)
    await expect(favoritesApi.add(1, 'tok')).rejects.toBeInstanceOf(SessionExpiredError)
  })
  it('remove на 404 → ок (идемпотентно, не бросает)', async () => {
    stubFetch(404)
    await expect(favoritesApi.remove(1, 'tok')).resolves.toBeUndefined()
  })
  it('add на 204 → ок', async () => {
    stubFetch(204)
    await expect(favoritesApi.add(1, 'tok')).resolves.toBeUndefined()
  })
})
