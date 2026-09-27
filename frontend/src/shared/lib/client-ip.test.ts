import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clientIpHeaders } from './client-ip'

const h = vi.hoisted(() => ({ headersGet: vi.fn<(k: string) => string | null>() }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => ({ get: h.headersGet }) }))

describe('clientIpHeaders', () => {
  beforeEach(() => {
    h.headersGet.mockReset()
    vi.stubEnv('INTERNAL_API_SECRET', 's3cret')
  })
  afterEach(() => vi.unstubAllEnvs())

  it('берёт первый адрес из X-Forwarded-For и добавляет секрет', async () => {
    h.headersGet.mockImplementation((k) => (k === 'x-forwarded-for' ? '203.0.113.7, 10.0.0.1' : null))
    await expect(clientIpHeaders()).resolves.toEqual({
      'X-Client-IP': '203.0.113.7',
      'X-Internal-Secret': 's3cret',
    })
  })

  it('без секрета — пусто, даже если IP есть', async () => {
    vi.stubEnv('INTERNAL_API_SECRET', '')
    h.headersGet.mockReturnValue('203.0.113.7')
    await expect(clientIpHeaders()).resolves.toEqual({})
  })

  it('без X-Forwarded-For — пусто', async () => {
    h.headersGet.mockReturnValue(null)
    await expect(clientIpHeaders()).resolves.toEqual({})
  })
})
