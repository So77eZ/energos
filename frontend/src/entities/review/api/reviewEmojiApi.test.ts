import { describe, it, expect, vi, afterEach } from 'vitest'
import { reviewEmojiApi } from './reviewEmojiApi'
import { SessionExpiredError } from '@shared/api/http'

const stubFetch = (status: number) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status })))

afterEach(() => vi.unstubAllGlobals())

// deleteNoBody идёт мимо httpRequest — un-react на протухшем токене (401)
// молча уходил в generic Error, пока react (через httpRequest) уже редиректил.
describe('reviewEmojiApi no-body — маппинг статусов', () => {
  it('remove на 401 → SessionExpiredError', async () => {
    stubFetch(401)
    await expect(reviewEmojiApi.remove(1, '🔥', 'tok')).rejects.toBeInstanceOf(SessionExpiredError)
  })
  it('remove на 404 → ок (реакции не было, не бросает)', async () => {
    stubFetch(404)
    await expect(reviewEmojiApi.remove(1, '🔥', 'tok')).resolves.toBeUndefined()
  })
})
