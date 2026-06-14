import { describe, it, expect } from 'vitest'
import { assertResponseOk, SessionExpiredError, RateLimitError } from './http'

const resWith = (status: number) => new Response(null, { status })

describe('assertResponseOk', () => {
  it('401 → SessionExpiredError', () => {
    expect(() => assertResponseOk(resWith(401))).toThrow(SessionExpiredError)
  })
  it('429 → RateLimitError', () => {
    expect(() => assertResponseOk(resWith(429))).toThrow(RateLimitError)
  })
  it('200 → ничего не бросает', () => {
    expect(() => assertResponseOk(resWith(200))).not.toThrow()
  })
  it('прочие ошибки (500) не маппит — обработает generic-слой', () => {
    expect(() => assertResponseOk(resWith(500))).not.toThrow()
  })
})
