import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withSessionGuard } from './auth-guard'
import { SessionExpiredError } from '@shared/api/http'

// Моки на framework-границе (server-only / next/*) — в node-env неизбежны.
// Тестируем НАШУ ветвистость guard'а, не поведение моков.
const h = vi.hoisted(() => ({
  clearToken: vi.fn(),
  headersGet: vi.fn<(k: string) => string | null>(),
  // имитируем реальный redirect(): бросает ошибку с digest NEXT_REDIRECT
  redirect: vi.fn((url: string) => {
    const e = new Error('NEXT_REDIRECT') as Error & { digest: string }
    e.digest = `NEXT_REDIRECT;replace;${url};307;`
    throw e
  }),
  // имитируем unstable_rethrow: рефлектит только framework-ошибки
  unstable_rethrow: vi.fn((e: unknown) => {
    const d = (e as { digest?: unknown })?.digest
    if (typeof d === 'string' && d.startsWith('NEXT_REDIRECT')) throw e
  }),
}))

vi.mock('server-only', () => ({}))
vi.mock('@shared/lib/session', () => ({ clearToken: h.clearToken }))
vi.mock('next/headers', () => ({ headers: async () => ({ get: h.headersGet }) }))
vi.mock('next/navigation', () => ({ redirect: h.redirect, unstable_rethrow: h.unstable_rethrow }))

describe('withSessionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.headersGet.mockReturnValue(null)
    vi.stubEnv('NEXT_PUBLIC_ORIGIN', 'https://own.app')
  })

  it('success — пробрасывает результат, без clear/redirect', async () => {
    const action = withSessionGuard(async (x: number) => x * 2)
    await expect(action(21)).resolves.toBe(42)
    expect(h.clearToken).not.toHaveBeenCalled()
    expect(h.redirect).not.toHaveBeenCalled()
  })

  it('SessionExpiredError → clearToken + redirect на логин с expired+return', async () => {
    h.headersGet.mockReturnValue('https://own.app/drinks?id=5') // Referer
    const action = withSessionGuard(async () => {
      throw new SessionExpiredError()
    })
    await expect(action()).rejects.toMatchObject({
      digest: expect.stringContaining('NEXT_REDIRECT'),
    })
    expect(h.clearToken).toHaveBeenCalledOnce()
    const url = h.redirect.mock.calls[0][0]
    expect(url).toContain('/auth/login?')
    expect(url).toContain('expired=1')
    expect(url).toContain('return=')
    expect(decodeURIComponent(url)).toContain('/drinks?id=5')
  })

  it('generic Error → пробрасывается как есть, без clearToken/redirect', async () => {
    const boom = new Error('boom')
    const action = withSessionGuard(async () => {
      throw boom
    })
    await expect(action()).rejects.toBe(boom)
    expect(h.clearToken).not.toHaveBeenCalled()
    expect(h.redirect).not.toHaveBeenCalled()
  })

  it('framework success-redirect — пробрасывается, НЕ трактуется как session-expiry', async () => {
    const red = new Error('NEXT_REDIRECT') as Error & { digest: string }
    red.digest = 'NEXT_REDIRECT;replace;/admin/drinks;307;'
    const action = withSessionGuard(async () => {
      throw red
    })
    await expect(action()).rejects.toBe(red)
    expect(h.clearToken).not.toHaveBeenCalled()
  })
})
