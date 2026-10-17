import { ApiError } from '@shared/api/http'

// Ошибки сохранения отзыва переводим по HTTP-статусу, а не по тексту `detail`: текст бэк может
// переформулировать, статус — часть контракта (docs/api.md). Всё остальное отдаём как есть.
const BY_STATUS: Readonly<Record<number, string>> = {
  // Один отзыв на пользователя и напиток.
  409: 'Вы уже оставили отзыв на этот напиток. Откройте напиток и отредактируйте его.',
}

export function localizeReviewError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && BY_STATUS[error.status]) return BY_STATUS[error.status]
  return (error instanceof Error && error.message) || fallback
}
