import { describe, expect, it } from 'vitest'
import { secondsUntilExpiry } from './token-expiry'

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = (payload: object) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`

describe('secondsUntilExpiry', () => {
  const now = Date.UTC(2026, 9, 11, 12, 0, 0)
  const nowSec = now / 1000

  it('токен на 24 часа → 86400 секунд', () => {
    expect(secondsUntilExpiry(jwt({ sub: '1', exp: nowSec + 86_400 }), now)).toBe(86_400)
  })

  it('частично прожитый токен → остаток', () => {
    expect(secondsUntilExpiry(jwt({ exp: nowSec + 90 }), now)).toBe(90)
  })

  it('уже истёкший → отрицательное число (вызывающий решает, что делать)', () => {
    expect(secondsUntilExpiry(jwt({ exp: nowSec - 10 }), now)).toBe(-10)
  })

  it('нет exp, не JWT, мусор, пусто → null', () => {
    expect(secondsUntilExpiry(jwt({ sub: '1' }), now)).toBeNull()
    expect(secondsUntilExpiry('abc', now)).toBeNull()
    expect(secondsUntilExpiry('a.!!!.c', now)).toBeNull()
    expect(secondsUntilExpiry('', now)).toBeNull()
  })

  it('exp строкой не считается', () => {
    expect(secondsUntilExpiry(jwt({ exp: String(nowSec + 100) }), now)).toBeNull()
  })
})
