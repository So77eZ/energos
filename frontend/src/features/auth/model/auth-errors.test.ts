import { describe, expect, it } from 'vitest'
import { localizeAuthError } from './auth-errors'

describe('localizeAuthError', () => {
  it('переводит известные коды и причины', () => {
    expect(localizeAuthError('RESET_PASSWORD_BAD_TOKEN', 'x')).toMatch(/недействительна/)
    expect(localizeAuthError('REGISTER_USER_ALREADY_EXISTS', 'x')).toMatch(/уже зарегистрирован/)
    expect(localizeAuthError('Password should be at least 8 characters', 'x')).toMatch(/8 символов/)
    expect(localizeAuthError('Password should not contain e-mail', 'x')).toMatch(/e-mail/)
  })

  it('неизвестный код-константа → запасной текст, не «RESET_PASSWORD_INVALID_PASSWORD»', () => {
    expect(localizeAuthError('RESET_PASSWORD_INVALID_PASSWORD', 'Не удалось')).toBe('Не удалось')
  })

  it('обычный текст ошибки отдаётся как есть, пустой → запасной', () => {
    expect(localizeAuthError('Слишком много запросов', 'x')).toBe('Слишком много запросов')
    expect(localizeAuthError('', 'Не удалось')).toBe('Не удалось')
  })
})
