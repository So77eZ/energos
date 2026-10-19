import { describe, expect, it } from 'vitest'
import { ApiError } from '@shared/api/http'
import { localizeAuthError } from './auth-errors'

describe('localizeAuthError', () => {
  it('коды бэка: занятые e-mail и имя', () => {
    expect(localizeAuthError(new ApiError(409, 'A user with this email already exists', 'EMAIL_ALREADY_EXISTS'), 'x')).toMatch(/e-mail уже зарегистрирован/)
    expect(localizeAuthError(new ApiError(409, 'A user with this username already exists', 'USERNAME_ALREADY_EXISTS'), 'x')).toMatch(/имя уже занято/)
  })

  it('INVALID_PASSWORD: причина переводится по тексту, неизвестная → общий текст', () => {
    expect(localizeAuthError(new ApiError(422, 'Password should be at least 8 characters', 'INVALID_PASSWORD'), 'x')).toMatch(/8 символов/)
    expect(localizeAuthError(new ApiError(422, 'Password is too weak', 'INVALID_PASSWORD'), 'x')).toBe('Пароль не подходит')
  })

  it('fastapi-users: код HTTP_400, исходный код в тексте', () => {
    expect(localizeAuthError(new ApiError(400, 'RESET_PASSWORD_BAD_TOKEN', 'HTTP_400'), 'x')).toMatch(/недействительна/)
  })

  it('строки (старый формат) тоже переводятся', () => {
    expect(localizeAuthError('REGISTER_USER_ALREADY_EXISTS', 'x')).toMatch(/уже зарегистрирован/)
    expect(localizeAuthError('Password should not contain e-mail', 'x')).toMatch(/e-mail/)
  })

  it('неизвестный код-константа → запасной текст', () => {
    expect(localizeAuthError(new ApiError(400, 'RESET_PASSWORD_INVALID_PASSWORD', 'HTTP_400'), 'Не удалось')).toBe('Не удалось')
  })

  it('обычный текст отдаётся как есть, пустой → запасной', () => {
    expect(localizeAuthError(new Error('Слишком много запросов'), 'x')).toBe('Слишком много запросов')
    expect(localizeAuthError(new Error(''), 'Не удалось')).toBe('Не удалось')
  })
})
