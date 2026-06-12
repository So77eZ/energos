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

## 2-й проход (по ревью дизайнера)

### 🔴 Светлая тема — доснята

Первый прогон был весь в дарке (мой пропуск + бажный инжект — тема живёт в
`localStorage energos_theme`, не `energos_prefs`). Исправлено, сняты `light__*`
(catalog/drink/glossary/tastemap/login) в `mobile-audit/`.

**Контраст светлой темы — разделён на WCAG-провалы (починены) и косметику (дизайнеру).**

🔴 **Починено (это не вкус, а провал читаемости ниже AA):**
- **Белый текст на filled-accent кнопках** (ВОЙТИ, ОТКРЫТЬ ПРОФИЛЬ, таб Вход) — в light
  cyan-заливка светлая, ink был `--bg-deep` (в light тоже светлый) → ≈1.4:1. Введён токен
  `--on-accent: #0a0a12` (тёмный ink в обеих темах; дарк не регрессит — там ink тоже тёмный),
  repoint всех `color: var(--bg-deep)` на filled-fill (CTA, бейджи, **аватары**) → ~9:1.
- **Футер / `--txt-quiet`** почти невидим в light (#8b93a6 на бледном) → поднят до `#5b6473`.
  Заодно вытащило МИН/МАКС глоссария, оси X/Y taste-map, плейсхолдеры форм (тот же токен).

Подтверждено ре-скрином: `light__login` (ВОЙТИ тёмный на cyan), `light__catalog` (футер виден).

🟡 **Косметика (→ дизайнеру, hex не навязываю):**
- Eyebrow-лейблы (ВХОД В СИСТЕМУ, ВИЗУАЛИЗАЦИЯ·2D) — cyan на пастели выцветает.
- Карточки каталога слабо отделяются от бело-голубого фона — чуть плотнее border/shadow в light.
- Радар-подписи КИС/СЛАД/ГАЗ на drink — бледный cyan на белом.

### 🟡 Ниты — починены (мелкие правки в этом PR)

- **tastemap FAB-occlusion** ✅ — `.tm-legend` получил `padding-right: 64px` на ≤640px;
  рейтинги в «ВСЕ ТОЧКИ» больше не уходят под FAB-рейл (подтверждено ре-скрином).
- **mob-sheet двойной cyan** ✅ — «Случайный напиток» → outline (`.mob-sheet-cta-ghost`),
  «Войти» остаётся filled. Один primary + один secondary.

### 🟢 Landscape-инсет — проверено

`.hdr` = `position: sticky` (в потоке внутри `.app`) → `.app { padding-left/right:
env(safe-area-inset-*) }` индентит десктоп-хедер/футер в ландшафте с вырезом. Т.е.
инсет висит на app-shell обёртке (не только mobile-shell), как и просил. Реально с
вырезом — только на устройстве (headless safe-area = 0).

## Вывод

Мобильная вёрстка в хорошей форме, механических поломок нет. Этот PR: FAB-коллизия,
iOS-meta, динамический theme-color, tap-targets, 2 нита (tastemap/mob-sheet). Открытый
пункт — **контраст светлой темы** (палитра, за дизайнером); скрины `light__*` готовы.
