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
  /** Лидерборд в админке: нужен общий список отзывов с авторами, а `GET /reviews/` отдаёт их только
   *  по одному напитку (B3 в docs/mvp-backend-questions.md). Лента отзывов на странице напитка и
   *  вкладка «Мои отзывы» в профиле от флага не зависят. */
  reviewAuthors: on(process.env.NEXT_PUBLIC_FF_REVIEW_AUTHORS),
  /** Редакторская (admin) оценка напитка: в API нет признака from_admin. */
  adminReviews: on(process.env.NEXT_PUBLIC_FF_ADMIN_REVIEWS),
  /** Рулетка «Случайный напиток» (гачапон): не входит в MVP (решено в ревью #330). Данные для неё
   *  грузились из браузера по /api, а в проде он недоступен; серверная загрузка — в ветке
   *  fix/gachapon-server-pool (#330), а в перспективе — эндпоинт бэка со случайными N напитками. */
  gachapon: on(process.env.NEXT_PUBLIC_FF_GACHAPON),
} as const
