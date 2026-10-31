import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@shared/api/http'
import { changeUsernameAction } from './actions'

const m = vi.hoisted(() => ({
  updateMe: vi.fn(),
  getToken: vi.fn(),
  revalidatePath: vi.fn(),
}))
vi.mock('@entities/user', () => ({ authApi: { updateMe: m.updateMe } }))
vi.mock('@shared/lib/session', () => ({ getToken: m.getToken, setToken: vi.fn(), clearToken: vi.fn() }))
vi.mock('@shared/lib/auth-guard', () => ({ redirectIfSessionExpired: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: m.revalidatePath }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

const form = (nickname: string) => {
  const fd = new FormData()
  fd.set('nickname', nickname)
  return fd
}

describe('changeUsernameAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    m.getToken.mockResolvedValue('tok')
    m.updateMe.mockResolvedValue({})
  })

  it('обрезает пробелы, шлёт ник и обновляет всё дерево (шапка, отзывы)', async () => {
    await expect(changeUsernameAction(null, form('  NewFox  '))).resolves.toEqual({ error: '', success: true })
    expect(m.updateMe).toHaveBeenCalledWith('tok', { username: 'NewFox' })
    expect(m.revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it.each([
    ['xy', 'Имя — от 3 до 32 символов'],
    ['a'.repeat(33), 'Имя — от 3 до 32 символов'],
    ['Лиса', 'В имени — только латинские буквы, цифры, «_» и «-»'],
    ['admin', 'Это имя зарезервировано, выберите другое'],
  ])('правила бэка проверяет до запроса: %j', async (nick, error) => {
    await expect(changeUsernameAction(null, form(nick))).resolves.toEqual({ error, nickname: nick })
    expect(m.updateMe).not.toHaveBeenCalled()
  })

  it('INVALID_USERNAME от бэка — понятный текст', async () => {
    m.updateMe.mockRejectedValue(new ApiError(422, 'Username must be 3-32 chars long', 'INVALID_USERNAME'))
    const res = await changeUsernameAction(null, form('Wolf'))
    expect(res?.error).toMatch(/^Имя не подходит/)
  })

  it('занятый ник — понятная ошибка, введённое значение возвращается в форму', async () => {
    m.updateMe.mockRejectedValue(new ApiError(409, 'A user with this username already exists', 'USERNAME_ALREADY_EXISTS'))
    await expect(changeUsernameAction(null, form('Wolf'))).resolves.toEqual({
      error: 'Это имя уже занято, выберите другое',
      nickname: 'Wolf',
    })
    expect(m.revalidatePath).not.toHaveBeenCalled()
  })
})
