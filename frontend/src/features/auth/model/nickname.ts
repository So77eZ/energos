// Правила публичного имени — копия UserManager.validate_username (backend/services/user_manager.py):
// бэк на любое нарушение отвечает одним INVALID_USERNAME, здесь проверяем до запроса и называем причину.
// Запреты «://», «www.», «.com», «.ru» отдельно не нужны: «.» и «:» не проходят по набору символов.

/** BANNED_USERNAMES из backend/core/constants.py; расхождение ловит nickname.test.ts. */
export const BANNED_NICKNAMES: ReadonlySet<string> = new Set([
  'admin',
  'administrator',
  'support',
  'root',
  'api',
  'help',
  'settings',
  'profile',
  'login',
  'logout',
  'register',
  'auth',
  'null',
  'undefined',
  'anonymous',
  'moderator',
  'system',
])

/** Причина, по которой бэк отклонит имя, или null, если оно подходит. */
export function validateNickname(nickname: string): string | null {
  if (nickname.length < 3 || nickname.length > 32) return 'Имя — от 3 до 32 символов'
  if (!/^[A-Za-z0-9_-]+$/.test(nickname)) return 'В имени — только латинские буквы, цифры, «_» и «-»'
  if (!/^[A-Za-z0-9]/.test(nickname) || !/[A-Za-z0-9]$/.test(nickname))
    return 'Имя должно начинаться и заканчиваться буквой или цифрой'
  if (/[_-]{2}/.test(nickname)) return '«_» и «-» не могут идти подряд'
  if (BANNED_NICKNAMES.has(nickname.toLowerCase())) return 'Это имя зарезервировано, выберите другое'
  return null
}
