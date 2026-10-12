import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientIp, pickClientIp } from './client-ip'

const h = vi.hoisted(() => ({ headersGet: vi.fn<(k: string) => string | null>() }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => ({ get: h.headersGet }) }))

describe('pickClientIp', () => {
  it('берёт первый адрес из списка', () => {
    expect(pickClientIp('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7')
  })

  it('принимает IPv6 и IPv4-mapped', () => {
    expect(pickClientIp('2001:db8::1')).toBe('2001:db8::1')
    expect(pickClientIp('::ffff:203.0.113.7')).toBe('::ffff:203.0.113.7')
  })

  it('пусто и мусор → null (в заголовок к бэку ничего не попадает)', () => {
    expect(pickClientIp(null)).toBeNull()
    expect(pickClientIp('')).toBeNull()
    expect(pickClientIp('unknown')).toBeNull()
    expect(pickClientIp('1.2.3.4\r\nX-Evil: 1')).toBeNull()
    expect(pickClientIp('<script>')).toBeNull()
  })
})

describe('clientIp', () => {
  beforeEach(() => h.headersGet.mockReset())

  it('читает X-Forwarded-For текущего запроса', async () => {
    h.headersGet.mockImplementation((k) => (k === 'x-forwarded-for' ? '203.0.113.7, 10.0.0.1' : null))
    await expect(clientIp()).resolves.toBe('203.0.113.7')
  })

  it('без заголовка → null', async () => {
    h.headersGet.mockReturnValue(null)
    await expect(clientIp()).resolves.toBeNull()
  })
})
