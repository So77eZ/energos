# Мобильный responsive-аудит — 2026-06-11

Живой прогон через Playwright на узких вьюпортах. Цель — найти реальную поломку
вёрстки на телефоне (не гадать по коду).

## Метод

`frontend/scripts/mobile-audit.mjs` (Playwright chromium, `isMobile+hasTouch`,
`deviceScaleFactor:2`) против поднятого docker-стека (`http://localhost`).
Age-gate заглушён (`localStorage energos_age_verified=true`), `/profile` — через
e2e storageState.

- **Вьюпорты:** 375×812 (iPhone), 360×800 (узкий Android), 812×375 (landscape).
- **Страницы (375):** catalog `/`, drink `/drinks?id=55`, compare, tier, glossary,
  submit, taste-map, auth/login, profile.
- **360:** catalog, drink, taste-map (самые рискованные). **landscape:** catalog, taste-map.
- **Состояния:** mob-sheet («Ещё»), search-overlay, tweaks-panel.
- **Скрины:** `frontend/mobile-audit/` (gitignored — артефакты на диске, для отсмотра).

## Результат: поломок нет

Вёрстка целостна на всех вьюпортах. Нет горизонтального скролла, overflow,
налезания текста, сломанных grid'ов.

| Экран | 375 | Заметки |
|-------|-----|---------|
| catalog | ✅ | stats 2×2, hero, сетка карточек 2-кол, FAB-рейл над таб-баром |
| drink | ✅ | hero-банка, метрики-радар, отзывы — всё в колонку |
| compare | ✅ | пустые слоты + список добавления |
| tier | ✅ | — |
| glossary | ✅ | — |
| submit | ✅ | гостю — гейт «Нужен вход» (ок) |
| taste-map | ✅ | scatter + 2 select'а + легенда; canvas не ломает ширину |
| auth/login | ✅ | — |
| profile (authed) | ✅ | — |
| mob-sheet / search / tweaks | ✅ | оверлеи открываются чисто, ряды sheet ≥44px |

## Phase 1 подтверждено визуально

- FAB-рейл (tweaks + наверх) сидит **над** 64px bottom-tab-баром — коллизии нет
  (был баг: ложились поверх). Tweaks-панель открывается над баром.
- theme-color динамический (код-проверка; address-bar в headless не виден).
- landscape (812px) → десктоп-лейаут (>640 брейкпоинт), корректно.

## Сделано в этом PR (механика)

- **tap-targets:** `@media (hover:none) and (pointer:coarse)` — мелкие иконки
  `.card-fav` (26px) / `.card-compare` получили 44px тап-зону через hit-slop `::after`
  **без изменения визуала** (плотность карточек не плывёт); `.select-min` → min-height 44px.

## Для дизайнера (по желанию, не блокеры)

- Скрины в `frontend/mobile-audit/` — отсмотреть тонкие вещи, которые downscale full-page
  мог скрыть (микро-отступы, контраст на light-теме).
- **landscape-notch:** `env(safe-area-inset-*)` заложены (.app + .mob-tabs + FAB right),
  но в headless Playwright safe-area=0 → реально проверяется только на устройстве с вырезом.
- Если захочется крупнее тап-зоны у эмодзи-реакций / других иконок — скажи, добавлю
  в тот же coarse-pointer блок.

## Вывод

Мобильный UX в хорошей форме. Этот PR закрыл реальный баг (FAB-коллизия) + iOS-meta +
theme-color + tap-targets. Полноценный responsive-overhaul (перекомпоновка под дизайн)
не требуется — нечего чинить.
