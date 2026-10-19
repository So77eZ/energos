import { afterEach, describe, it, expect, vi } from 'vitest'
import { ApiError, assertResponseOk, httpRequest, parseApiError, parseError, SessionExpiredError, RateLimitError } from './http'

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

describe('parseApiError: формат {"error": {code, message}}', () => {
  const err = (error: unknown, status = 409) => new Response(JSON.stringify({ error }), { status })

  it('код и сообщение берутся из error', async () => {
    expect(await parseApiError(err({ code: 'REVIEW_ALREADY_EXISTS', message: 'You have already submitted a review' })))
      .toEqual({ code: 'REVIEW_ALREADY_EXISTS', message: 'You have already submitted a review' })
  })

  it('ошибка валидации: текст из fields, а не общий message', async () => {
    const res = err({ code: 'VALIDATION_ERROR', message: 'Request validation failed', fields: [{ msg: 'Field required' }] }, 422)
    expect(await parseApiError(res)).toEqual({ code: 'VALIDATION_ERROR', message: 'Field required' })
  })

  it('ошибка fastapi-users: код HTTP_400, исходный код в message', async () => {
    expect(await parseApiError(err({ code: 'HTTP_400', message: 'RESET_PASSWORD_BAD_TOKEN' }, 400)))
      .toEqual({ code: 'HTTP_400', message: 'RESET_PASSWORD_BAD_TOKEN' })
  })

  it('старый формат detail → code null', async () => {
    const res = new Response(JSON.stringify({ detail: 'Not found' }), { status: 404 })
    expect(await parseApiError(res)).toEqual({ code: null, message: 'Not found' })
  })
})

describe('httpRequest: код ошибки доходит до ApiError', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('ApiError.code и status из ответа', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'USERNAME_ALREADY_EXISTS', message: 'taken' } }), { status: 409 })))
    const e = await httpRequest('/x').catch((x) => x)
    expect(e).toBeInstanceOf(ApiError)
    expect(e).toMatchObject({ status: 409, code: 'USERNAME_ALREADY_EXISTS', message: 'taken' })
  })
})
