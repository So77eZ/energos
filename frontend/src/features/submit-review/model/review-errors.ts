import { ApiError } from '@shared/api/http'

// Ошибки сохранения отзыва переводим по коду бэка (`{"error": {"code": …}}`), а не по тексту:
// текст бэк может переформулировать, код — часть контракта. Всё остальное отдаём как есть.
const BY_CODE: Readonly<Record<string, string>> = {
  REVIEW_ALREADY_EXISTS: 'Вы уже оставили отзыв на этот напиток. Откройте напиток и отредактируйте его.',
  VERIFIED_USER_REQUIRED: 'Подтвердите e-mail, чтобы оставлять отзывы.',
  REVIEW_NOT_OWNER: 'Это не ваш отзыв.',
  ENERGY_DRINK_NOT_FOUND: 'Напиток не найден — возможно, его удалили.',
}

export function localizeReviewError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code && BY_CODE[error.code]) return BY_CODE[error.code]
    // Бэк без кодов: один отзыв на пользователя и напиток → 409.
    if (error.status === 409) return BY_CODE.REVIEW_ALREADY_EXISTS
  }
  return (error instanceof Error && error.message) || fallback
}
