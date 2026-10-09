// Фича-флаги MVP. API ветки `mvp` (docs/api.md) покрывает только auth, напитки и отзывы,
// всё остальное выключено, пока бэк не вернёт эндпоинты. Что именно нужно от бэка — в
// docs/mvp-backend-questions.md.
//
// Включить фичу: NEXT_PUBLIC_FF_<NAME>=1 при сборке (NEXT_PUBLIC_* вшивается в бандл,
// после смены нужен ребилд образа). По умолчанию всё выключено.
const on = (v: string | undefined) => v === '1' || v === 'true'

export const FEATURES = {
  /** Избранное: /auth/me/favorites — в API нет. */
  favorites: on(process.env.NEXT_PUBLIC_FF_FAVORITES),
  /** Эмодзи-реакции на отзывы: /reviews/{id}/emojis — в API нет. */
  emojiReactions: on(process.env.NEXT_PUBLIC_FF_EMOJI_REACTIONS),
  /** Загрузка аватарок: /auth/me/avatar — в API нет. */
  avatars: on(process.env.NEXT_PUBLIC_FF_AVATARS),
  /** Заявки на добавление напитков: /add-requests — в API нет. */
  submissions: on(process.env.NEXT_PUBLIC_FF_SUBMISSIONS),
  /** Достижения/бейджи: нужны счётчики в /auth/me и данные об авторах отзывов. */
  achievements: on(process.env.NEXT_PUBLIC_FF_ACHIEVEMENTS),
  /** «Мой отзыв», автор и комментарий в списках: нужны user_id/id/comment в выдаче отзывов. */
  reviewAuthors: on(process.env.NEXT_PUBLIC_FF_REVIEW_AUTHORS),
  /** Редакторская (admin) оценка напитка: в API нет признака from_admin. */
  adminReviews: on(process.env.NEXT_PUBLIC_FF_ADMIN_REVIEWS),
} as const
