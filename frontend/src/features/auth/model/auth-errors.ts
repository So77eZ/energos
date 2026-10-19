import { ApiError } from '@shared/api/http'

// Ошибки авторизации. Свои ошибки бэк отдаёт кодом (`{"error": {"code": …}}`) — переводим по нему.
// Ошибки fastapi-users (битый токен сброса/подтверждения) приходят с кодом `HTTP_400`, а их собственный
// код (RESET_PASSWORD_BAD_TOKEN и т. п.) лежит в тексте — их переводим по тексту.
const BY_CODE: Readonly<Record<string, string>> = {
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким e-mail уже зарегистрирован',
  USERNAME_ALREADY_EXISTS: 'Это имя уже занято, выберите другое',
}

const BY_TEXT: ReadonlyArray<readonly [string, string]> = [
  ['RESET_PASSWORD_BAD_TOKEN', 'Ссылка недействительна или устарела. Запросите сброс пароля заново.'],
  ['VERIFY_USER_BAD_TOKEN', 'Ссылка недействительна или устарела. Запросите письмо ещё раз в профиле.'],
  ['REGISTER_USER_ALREADY_EXISTS', 'Пользователь с таким e-mail уже зарегистрирован'],
  ['Password should be at least 8 characters', 'Пароль должен быть не короче 8 символов'],
  ['Password should not contain e-mail', 'Пароль не должен содержать ваш e-mail'],
]

export function localizeAuthError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code && BY_CODE[error.code]) return BY_CODE[error.code]
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  const hit = BY_TEXT.find(([key]) => message.includes(key))
  if (hit) return hit[1]
  // INVALID_PASSWORD с непереведённой причиной: общий текст понятнее английского.
  if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') return 'Пароль не подходит'
  // Код без перевода (RESET_PASSWORD_INVALID_PASSWORD и т. п.) пользователю ничего не говорит.
  return /^[A-Z_]{8,}$/.test(message.trim()) ? fallback : message || fallback
}
