// Сообщения бэка при сохранении отзыва приходят на английском (detail без кода, статус до фронта
// не доходит) — переводим известные, остальное отдаём как есть.
const KNOWN: ReadonlyArray<readonly [string, string]> = [
  // 409: один отзыв на пользователя и напиток (бэк 35a00ed; раньше — 403 «Only one review per user…»).
  ['already submitted a review', 'Вы уже оставили отзыв на этот напиток. Откройте напиток и отредактируйте его.'],
  ['Only one review per user', 'Вы уже оставили отзыв на этот напиток. Откройте напиток и отредактируйте его.'],
  ['User is not verified', 'Подтвердите e-mail, чтобы оставлять отзывы.'],
]

export function localizeReviewError(message: string, fallback: string): string {
  const hit = KNOWN.find(([key]) => message.includes(key))
  return hit ? hit[1] : message || fallback
}
