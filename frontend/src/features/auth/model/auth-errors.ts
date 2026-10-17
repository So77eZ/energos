// Сообщения бэка (fastapi-users и UserManager.validate_password) — на английском или кодами вроде
// RESET_PASSWORD_BAD_TOKEN. Переводим известные, остальное отдаём как есть.
const KNOWN: ReadonlyArray<readonly [string, string]> = [
  ['RESET_PASSWORD_BAD_TOKEN', 'Ссылка недействительна или устарела. Запросите сброс пароля заново.'],
  ['VERIFY_USER_BAD_TOKEN', 'Ссылка недействительна или устарела. Запросите письмо ещё раз в профиле.'],
  ['REGISTER_USER_ALREADY_EXISTS', 'Пользователь с таким e-mail уже зарегистрирован'],
  ['Password should be at least 8 characters', 'Пароль должен быть не короче 8 символов'],
  ['Password should not contain e-mail', 'Пароль не должен содержать ваш e-mail'],
]

export function localizeAuthError(message: string, fallback: string): string {
  const hit = KNOWN.find(([key]) => message.includes(key))
  if (hit) return hit[1]
  // Код без перевода (RESET_PASSWORD_INVALID_PASSWORD и т. п.) пользователю ничего не говорит.
  return /^[A-Z_]{8,}$/.test(message.trim()) ? fallback : message || fallback
}
