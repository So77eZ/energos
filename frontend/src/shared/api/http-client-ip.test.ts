import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { httpRequest, rawRequest } from './http'

const ip = vi.hoisted(() => ({ clientIp: vi.fn<() => Promise<string | null>>() }))
vi.mock('#client-ip', () => ({ clientIp: ip.clientIp }))

const ok = () => new Response('{}', { status: 200 })
let fetchMock: ReturnType<typeof vi.fn>
const sentHeaders = () => fetchMock.mock.calls[0][1].headers as Record<string, string>

beforeEach(() => {
  ip.clientIp.mockReset()
  fetchMock = vi.fn().mockImplementation(async () => ok())
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('X-Forwarded-For в запросах фронта к бэку', () => {
  it('реальный IP клиента уходит заголовком X-Forwarded-For', async () => {
    ip.clientIp.mockResolvedValue('203.0.113.7')
    await rawRequest('/api/v1/auth/login', { method: 'POST' })
    expect(sentHeaders()['X-Forwarded-For']).toBe('203.0.113.7')
  })

  it('работает и через httpRequest (server actions, server components)', async () => {
    ip.clientIp.mockResolvedValue('203.0.113.7')
    await httpRequest('/api/v1/auth/me', { headers: { Authorization: 'Bearer t' } })
    const h = sentHeaders()
    expect(h['X-Forwarded-For']).toBe('203.0.113.7')
    expect(h.Authorization).toBe('Bearer t')
  })

  it('запросы из Data Cache (revalidate) без IP: иначе у каждого клиента свой кеш списка', async () => {
    ip.clientIp.mockResolvedValue('203.0.113.7')
    await rawRequest('/api/v1/energy-drinks/', { next: { revalidate: 60, tags: ['drinks'] } })
    expect(sentHeaders()['X-Forwarded-For']).toBeUndefined()
    expect(ip.clientIp).not.toHaveBeenCalled()
  })

  it('force-cache тоже без IP', async () => {
    await rawRequest('/x', { cache: 'force-cache' })
    expect(sentHeaders()['X-Forwarded-For']).toBeUndefined()
  })

  it('IP неизвестен (вне запроса, нет заголовка) → заголовка нет, запрос уходит', async () => {
    ip.clientIp.mockResolvedValue(null)
    await rawRequest('/x')
    expect(sentHeaders()['X-Forwarded-For']).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('сбой при определении IP не ломает запрос', async () => {
    ip.clientIp.mockRejectedValue(new Error('no request scope'))
    await expect(rawRequest('/x')).resolves.toBeInstanceOf(Response)
    expect(sentHeaders()['X-Forwarded-For']).toBeUndefined()
  })

  it('свои заголовки вызывающего сохраняются, Origin по-прежнему ставится на сервере', async () => {
    ip.clientIp.mockResolvedValue('203.0.113.7')
    await rawRequest('/x', { headers: { 'Content-Type': 'application/json' } })
    const h = sentHeaders()
    expect(h['Content-Type']).toBe('application/json')
    expect(h.Origin).toBeTruthy()
  })
})
