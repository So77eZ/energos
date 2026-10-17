import { describe, it, expect } from 'vitest'
import { assertResponseOk, parseError, SessionExpiredError, RateLimitError } from './http'

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

const json422 = (detail: unknown) =>
  new Response(JSON.stringify({ detail }), { status: 422 })

describe('parseError', () => {
  it('ValueError из валидатора (ctx.error = {}) → текст из msg без префикса', async () => {
    // реальный ответ FastAPI на POST /auth/register/ с логином кириллицей
    const res = json422([{
      type: 'value_error',
      loc: ['body', 'username'],
      msg: 'Value error, Логин может содержать только буквы, цифры, _ и -',
      input: 'друг',
      ctx: { error: {} },
    }])
    expect(await parseError(res)).toBe('Логин может содержать только буквы, цифры, _ и -')
  })

  it('строковый ctx.error используется как есть', async () => {
    const res = json422([{ msg: 'Value error, общий текст', ctx: { error: 'точный текст' } }])
    expect(await parseError(res)).toBe('точный текст')
  })

  it('несколько ошибок склеиваются через «; »', async () => {
    const res = json422([
      { msg: 'String should have at least 3 characters', ctx: { min_length: 3 } },
      { msg: 'String should have at least 8 characters', ctx: { min_length: 8 } },
    ])
    expect(await parseError(res)).toBe(
      'String should have at least 3 characters; String should have at least 8 characters',
    )
  })

  it('строковый detail возвращается как есть', async () => {
    const res = new Response(JSON.stringify({ detail: 'Пользователь с таким именем уже существует' }), { status: 400 })
    expect(await parseError(res)).toBe('Пользователь с таким именем уже существует')
  })

  it('detail-объект fastapi-users {code, reason} → reason, а не «[object Object]»', async () => {
    const res = new Response(JSON.stringify({
      detail: { code: 'RESET_PASSWORD_INVALID_PASSWORD', reason: 'Password should be at least 8 characters' },
    }), { status: 400 })
    expect(await parseError(res)).toBe('Password should be at least 8 characters')
  })

  it('detail-объект без reason → code', async () => {
    const res = new Response(JSON.stringify({ detail: { code: 'SOME_CODE' } }), { status: 400 })
    expect(await parseError(res)).toBe('SOME_CODE')
  })
})
