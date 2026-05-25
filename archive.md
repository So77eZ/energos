# Архив реализованного

Перенесено из `improvements.md` чтобы не загромождать список активных задач.
Хронологически — последние работы наверху.

---

## Доработки от бэкендера (коммиты `6c7a0ad` → `97b5aac`)

- ~~**Pydantic mismatch на `GET /me/favorites/`**~~ ✅ Бэк теперь возвращает `[d.id for d in user.favorite_energy_drinks]` — нормальный `list[int]`. Hack-нормализация в `favoritesApi.list` оставлена defensive-кодом, но больше не нужна для работы. (`6c7a0ad`)
- ~~**Favorites API: POST → PUT (idempotent 204)**~~ ✅ Add теперь `PUT /api/auth/me/favorites/{id}/` (статус 204), не дублируется при повторных вызовах. Фронт перевёл `add` на общую `requestNoBody`-обёртку. (`6c7a0ad`)
- ~~**Toast при добавлении в избранное — обрезанное имя**~~ ✅ Раньше тост показывал только variant («Цитрус, ананас»), теперь полное имя напитка («VULKAN Цитрус, ананас»). Правка в `DrinkCard.tsx`. (`2713d9b`)
- ~~**Кэш браузера при login/logout — state Provider'ов не сбрасывался**~~ ✅ Кнопка «Выйти» в профиле теперь делает `await logoutAction()` + `window.location.href = '/'` (вместо `<form action>`), что гарантированно сбрасывает FavoritesProvider/UserProvider client-state. Аналогично в LoginForm/RegisterForm + `auth/model/actions.ts`. (`97b5aac`)

---

## Спринт «Каталог + Favorites/Emoji + e2e» (коммит `9921e8b`)

- ~~**Heatmap-вью каталога**~~ ✅ Альтернативный режим к сетке: таблица «напиток × метрика» с цветовой тепловой картой (alpha = (v/5)² · 0.55). Toggle `grid`/`heatmap` в SortBar (`view-switch` с двумя кнопками). State хранится в `catalog-search` контексте.
- ~~**Расширенный фильтр-дропдаун**~~ ✅ Filter-popover на месте старой Tailwind-модалки: чипы тиров S/A/B/C/D (multi-select), dual range-slider цены, toggle'ы «Без сахара» и «Только новые». Click-outside + Esc, счётчик активных фильтров на кнопке. `framer-motion` выкинут, replacement через CSS `@keyframes`.
- ~~**FilterPanel на старом Tailwind-дизайне**~~ ✅ Переписан как popover (`.filter-pop`/`.filt-section`/`.filt-chip`/`.filt-range`), с тир-чипами, dual range-slider'ом цены и toggle'ами.
- ~~**Третья rail-карточка «СРАВНЕНИЕ»**~~ ✅ Promo-блок в SideRail главной со ссылкой на `/compare` — повторяет дизайн `page-home.jsx`.
- ~~**Избранные энергетики**~~ ✅ Подключено к backend API. Server action `toggleFavoriteAction` (cookie из `session.ts`), endpoints `favoritesApi` (list/add/remove). `FavoritesProvider` принимает `initial[]` + `userId` от server-side fetch в `layout.tsx`. Оптимистичный update + revert при ошибке. Mock localStorage убран. Кнопка `.card-fav` 26×26 в `.card-tags`.
- ~~**Реакции эмодзи на отзыв**~~ ✅ `features/emoji-reactions` с `EmojiBar` (агрегат + picker из 8 пресет-смайликов), server action `toggleEmojiReactionAction`, endpoints `reviewEmojiApi`. Подключён в `UserReviewCard`, `MyReviewCard`, `AdminReviewCard`. Свои реакции подсвечены, клик-toggle.
- ~~**TweaksPanel — UI смены темы и акцента**~~ ✅ Floating fab в правом нижнем углу (`widgets/tweaks-panel`), панель с темой (dark/light), 5 акцентами, шрифтом и тремя toggle'ами эффектов (liquidBg/grain/scanlines).
- ~~**Шрифт-свитчер**~~ ✅ Добавлен в TweaksPanel секцией «Шрифт» — нативный `<select>` с превью каждого шрифта (5 вариантов через `useUserPreferences()`). Self-hosted Monocraft через `@font-face` (public/fonts/Monocraft.ttc). Orbitron + Rajdhani добавлены в Google Fonts `<link>`.
- ~~**TweaksBody переиспользован в профиле**~~ ✅ Вынесен из TweaksPanel; в `ProfilePage` добавлен 5-й таб «Оформление» с тем же контентом.
- ~~**HeaderSearchBar в `.search` контейнере**~~ ✅ Header теперь рендерит ту же плашку на всех страницах: на `/`, `/taste-map` и др. — функциональный input; на `/glossary`, `/compare`, `/tier` etc. — Link-вариант с тем же визуалом ведущий на каталог. Навигация не сдвигается.
- ~~**ScrollToTop ребрендинг**~~ ✅ Единый класс `.up-fab` с `.twk-fab` (accent-цвет, размер 44×44, `bottom: 72px` чтобы не наезжать на TweaksPanel-fab). Tailwind/lucide cruft выкинут.
- ~~**E2E тесты (Playwright)**~~ ✅ `playwright.config.ts` с 3 projects: `chromium` (smoke), `setup` (auth), `chromium-auth`. 9 guest-тестов + 5 authed-тестов (profile, /submit, favorites toggle, emoji-реакция). `e2e/auth.setup.ts` логинит/регистрирует тест-юзера напрямую в Caddy, сохраняет storageState. Скрипты `test:e2e`, `test:e2e:ui`.
- ~~**Z-index sortbar**~~ ✅ Поднят явно — `backdrop-filter` создавал свой stacking context и filter-popover терялся за `.catalog-cta`/`.home-split`.
- ~~**Scanlines / grain заметнее**~~ ✅ Scanlines 3.5% (было 1.8%); grain 0.32 (было 0.22). В светлой теме scanlines через `multiply` вместо `overlay`.

---

## Из миграции дизайна

- ~~**`/tier` страница (tier-list)**~~ ✅ `TierPage` + widget `tier-page` — группировка напитков по S/A/B/C/D через `tierFromRating(rating)`.
- ~~**`/glossary` (`/sommelier`) страница**~~ ✅ `GlossaryPage` — словарь энергетических терминов и метрик с примерами напитков.
- ~~**Footer на новый дизайн**~~ ✅ `widgets/footer/ui/Footer.tsx` переписан на новые классы `.foot`/`.foot-left`/`.foot-logo`/`.foot-right`/`.foot-link`. Иконка телеграма заменена с chat-bubble на правильный paper-plane.

---

## Критичные проблемы

- ~~**CORS + credentials**~~ ✅ Список разрешённых origin'ов вынесен в `ALLOWED_ORIGINS`. По умолчанию только `localhost:3000`.
- ~~**Нет проверки владельца отзыва на бэкенде**~~ ✅ `PUT/DELETE /reviews/{id}` возвращает 403 если не владелец и не admin.
- ~~**Фронтенд не проверяет роль пользователя**~~ ✅ Серверная проверка роли на всех admin-страницах (коммит `90144ae`).
- ~~**Нет валидации пароля при регистрации**~~ ✅ `field_validator` в Pydantic v2: мин. 8 символов, заглавная, строчная, цифра. Валидация логина 3–50 символами и только `[a-zA-Z0-9_-]`.
- ~~**Порт БД торчит наружу**~~ ✅ PostgreSQL доступна только внутри Docker-сети `backend`, порт не публикуется.

---

## Средние замечания

- ~~**Нет ForeignKey в моделях**~~ ✅ `ForeignKey("energy_drinks.id")` и `ForeignKey("users.id")` с relationships.
- ~~**Загрузка изображений без валидации**~~ ✅ Разрешены только jpeg/png/webp/gif, лимит 5 МБ.
- ~~**Нет пагинации**~~ ✅ Бэкенд: `limit`/`offset` в `GET /energy-drinks/`. Фронт: 12 напитков / 6 отзывов на страницу.
- ~~**Дублирование bearer-заголовка**~~ ✅ `bearerHeaders(token)` вынесена в `@shared/api/http`.

---

## Реализованные идеи и фидбек

- ~~**Удаление собственного отзыва**~~ ✅ Реализовано.
- ~~**Рейтинг в каталоге**~~ ✅ Звёздный рейтинг + акцентный цвет карточки на основе метрик.
- ~~**Кнопка «Наверх»**~~ ✅ Появляется при скролле вверх после 300px.
- ~~**Footer**~~ ✅ Название проекта, год, кафедра, ссылки на GitHub/Email.
- ~~**CTA вместо прочерка**~~ ✅ «Оцените первым!» у карточек без рейтинга.
- ~~**Иконка вместо бейджа «Без сахара» на мобильных**~~ ✅ `CandyOff` на `< sm`, текст на `sm+`.
- ~~**URL `/reviews?id=16` → `/drinks?id=16`**~~ ✅ Роут переименован.
- ~~**Пагинация (Слава)**~~ ✅ Реализована (постраничная, 12/6).
- ~~**Убрать `review.rating` из фронта**~~ ✅ Бэк дропнул колонку (миграция `585053038cea`); фронт везде вычисляет `calcRating(metrics)`, payload без поля `rating` (коммит `3092153`).
- ~~**Добавить в админку поле для загрузки фото**~~ ✅ Форма `DrinkForm` заменила текстовое поле URL на file-upload с превью и кнопкой очистки.
- ~~**Исправить обрезание строки поиска**~~ ✅ Placeholder сокращён до «Поиск…».
- ~~**Rate limiter на бэкенд**~~ ✅ `slowapi` in-memory: login 10/мин, register 5/мин, reviews 10/мин. Фронт обрабатывает HTTP 429 через `RateLimitError`.
- ~~**Яндекс Метрика**~~ ✅ Счётчик 109003264 подключён через `next/script` (`afterInteractive`), webvisor + clickmap включены.
- ~~**Поиск на странице отзывов**~~ ✅ Исправлен сломанный маршрут `/reviews` → `/drinks` в `HeaderSearchBar`.
- ~~**Отзыв администратора на странице напитка**~~ ✅ Администратор видит своё «Ваш администраторский отзыв» с кнопками редактирования; кнопка «Оставить отзыв» не показывается если отзыв уже есть.
- ~~**Автооткрытие формы отзыва из профиля**~~ ✅ При выборе напитка через «Добавить» в профиле форма отзыва открывается автоматически (`?review=1`).
