# Архив реализованного

Перенесено из `improvements.md` чтобы не загромождать список активных задач.
Хронологически — последние работы наверху.

---

## Аватарки + `<Sheet>`-примитив

- ~~**Аватарки пользователей**~~ ✅ (PR#32, мобильный z-index фикс #33) `entities/user` — универсальный `<Avatar username size seed? avatarKind? avatarUrl? avatarSeed? />` (upload→`<img>`, preset→identicon, иначе буквенный кружок `pickAvatarColor`); мемо-`makeIdenticon`; заменил инлайн-кружки в Header/Profile/Leaders + слот в UserReviewCard. `features/avatar-editor` — `AvatarEditorSheet` (react-easy-crop + свой canvas mask-overlay для WYSIWYG hex/rounded + бренд-стейдж + пресеты + crop→PNG alpha с EXIF-ориентацией). Форма печётся в PNG (без shape-поля); пресет/буква всегда circle. **Висяк бэк #10** (`docs/backend-contract.md`): `avatar_kind/url/seed` + POST/PUT(preset)/DELETE `/api/auth/me/avatar` — пока бека нет, работает на localStorage-демо (`TODO(backend #10)`), демо-резолв client-side.
- ~~**Единый `<Sheet>`/`<Overlay>`-примитив**~~ ✅ (PR#34) `shared/ui/Sheet` — инкапсулирует `createPortal(document.body)` + mounted-guard + `useScrollLock` + focus-trap + ESC + scrim + варианты bottom/center + опц. шапка; z через проп `zIndex`/CSS-var `--sheet-z`. Убирает родовую stacking-граблю (fixed-оверлей внутри `<main>` z-index:1 перекрывался `.mob-tabs` z-800). Мигрированы ВСЕ оверлеи (focus-trap+Esc бонусом каждому): `AvatarEditorSheet` (PR#34), `MobileNav` mob-sheet+mob-search (PR#36, добавлен `variant="top"` — зеркало bottom, safe-area-top), `GachaponMachine` (PR#37, `variant="center"` + `.sheet.gacha-shell` прозрачная-обёртка: Sheet=чроме, видимая панель=внутр. `.gacha-machine` as-is; generic-скрим принят вместо saturated-blur). Варианты примитива: bottom/center/top. Опц. named-обёртки (ConfirmSheet/GachaponSheet) — на потом, если будет повтор. `FilterPanel` — anchored-popover, ДРУГОЙ примитив (не Sheet).

---

## Геймификация: бейджи, банки-игра, гачапон, пасхалки, heatmap

Спринт вовлечённости. Бо́льшая часть считается на клиенте; часть метрик бейджей — висячка под бэкенд.

- ~~**Достижения и бейджи (эскалация)**~~ ✅ (PR#7) `entities/achievement/` — 22 бейджа в 4 тирах (bronze/silver/gold/elite), `evaluateAchievements(stats)` из реальных stats профиля (reviewsCount, reviewsWithComments, avgSweetness, nightReviews, tiersCovered, favoritesCount, submissions). Источники: `client` (считаются на фронте), `backend` (висячка — «Первопроходец»/«Активист»/«Топ-10%» ждут эндпоинтов, помечены `awaitingBackend`), `secret` (пасхалки). `AchievementsTab` показывает прогресс; `BadgeCluster` — топ-3 по престижу у ника в карточке отзыва. Подробный backlog-список из 10 пунктов закрыт этой реализацией.
- ~~**Тост «достижение разблокировано»**~~ ✅ (PR#14) `shared/lib/achievement-toasts/` — `notifyUnlocks`/`toastAchievement` показывают медаль-тост при первом анлоке (дедуп через `seen`), клик ведёт в профиль.
- ~~**3D-банки: клик-разгон до взрыва (мини-игра)**~~ ✅ (PR#18, #21) Заменён hover-трекинг на клик: каждый клик добавляет угловое ускорение, серия раскручивает банку до взрыва, без кликов — затухание (демпфер). Pure-ядро интегратора (`can-game`, unit-tested: границы каскада, clamp, демпфер), состояние в localStorage. 3 секретных бейджа: «Подрывник» (10 взрывов), «Турбина» (разгон за ≤2с), «Цепная реакция» (5 подряд). Гейт `onBurst` на гидрацию; ховер-взрыв не даёт «Турбину» даром.
- ~~**Random drink / Gachapon**~~ ✅ (PR — `feat/gacha-cs2-reel`, #20) `shared/lib/gachapon/` — рулетка в стиле CS2: pure reel-ядро (`reel.ts`, unit-tested) + провайдер + `GachaponMachine`. WAAPI 2-фазный overshoot-лендинг, мягкий settle с подтяжкой к центру выигрыша, reduced-motion-вариант. Триггеры «🎰» в навигации, редирект на выпавший напиток. e2e 3/3.
- ~~**Easter eggs (3 штуки)**~~ ✅ (PR#10, #13) `shared/lib/easter-eggs/` — (1) **Konami-код** → retro-режим (CRT-accent + форс grain/scan + Monocraft через `!important`); (2) **100 кликов по логотипу** → Fireworks-оверлей + бейдж «Логотипоман»; (3) **10 спрятанных молний** ⚡ по страницам → коллекционирование (бейдж «Энергетик-следопыт»). Konami-матчер pure/unit-tested, konami-гард на поля ввода, hydrated-гейт молний, storage как источник счётчика.
- ~~**Calendar heatmap активности в профиле**~~ ✅ (PR#9) `widgets/profile/ui/CalendarHeatmap.tsx` + pure-ядро `buildActivityCalendar` (`activity-calendar.ts`, unit-tested) — GitHub-style сетка 53 недели сверху таба «Отзывы», цвет по числу отзывов в день, тултипы, легенда, выравнивание месяцев/дней недели.

---

## Каталог: бесконечная подгрузка + скролл к каталогу при поиске

- ~~**Бесконечная подгрузка каталога**~~ ✅ (PR#11) `useInfiniteReveal` — IntersectionObserver-довыдача + восстановление позиции скролла через sessionStorage при возврате на главную.
- ~~**Скролл к каталогу при поиске**~~ ✅ (PR#15) `scroll-margin` якоря каталога под sticky-шапку; при вводе в поиск страница доводит до сетки. Де-факто десктоп-онли (на ≤640px page-scroll лочится оверлеями). e2e на десктоп + мобайл.

---

## Карта вкусов: выбор осей + фикс наложения подписи

- ~~**Карта вкусов: выбор осей X/Y**~~ ✅ Уже было реализовано (два `<select>` по всем 6 метрикам в [TasteMapChart.tsx](frontend/src/widgets/taste-map/ui/TasteMapChart.tsx), точки строятся по `metrics[axisX]/[axisY]`). Backlog-пункт «только 2 из 6» устарел — пикеры добавлены при миграции. Вычеркнут.
- ~~**Визуальный баг: подпись оси X перекрывала квадрант Q4**~~ ✅ «СЛАДОСТЬ →» (заголовок X) и «Q4: СБАЛАНСИРОВАНО» оба сидели в правом нижнем углу графика и накладывались. Заголовок X вынесен **под** ось (ниже числовых меток, `y = VIEWBOX_H - PAD + 42`) — конвенциональное место подписи, квадрант остаётся в углу. Проверено скриншотом.

---

## Сравнение напитков: «только различающиеся» + золото победителя

- ~~**Side-by-side сравнение с тогглером «Только различающиеся» + золотая обводка победителя**~~ ✅ Страница `/compare` уже имела side-by-side бары + ★-победителя; добавлено недостающее:
  - **Тоггл «Только различающиеся»** ([ComparePage.tsx](frontend/src/widgets/compare-page/ui/ComparePage.tsx)) — свитч (переиспользован `.filt-toggle`) над метриками; `visibleMetrics` прячет строки где показанные (округлённые до 0.1, как видит юзер) значения совпадают у всех. Пустое состояние «Все метрики совпадают».
  - **Золотая рамка победителя** ([globals.css](frontend/src/app/globals.css)): `.cmp-bar-cell.winner` и звезда `.cmp-winner` переведены с accent-цвета на `color-mix(var(--c-amber) 72%, accent 28%)` — «трофейное» золото, оттенок которого плывёт с акцентом темы. Победитель по метрике = max value.

---

## Техдолг фронта: чистка dead-code (glass shim + enrichDrinks)

- ~~**Compatibility-shim `.glass` / `.glass-surface`**~~ ✅ Удалён из [globals.css](frontend/src/app/globals.css). Аудит показал: `.glass-surface` — ноль потребителей; `.glass` использовал только `shared/ui/Card`, а сам `Card` нигде не импортировался. Снесён и shim-блок, и мёртвый компонент `Card` (Card.tsx + index.ts). `.card-glass` (реальная карточка каталога) — другой класс, не тронут.
- ~~**`enrichDrinks` дважды на drink-странице**~~ ❌ Признан невалидным, убран из backlog. `enrichDrinks` уже O(n+m) (индексация отзывов в `Map`), везде в `useMemo` либо разовый вызов в server-компоненте. Разные роуты (главная vs `/drinks`) не рендерятся одновременно — «соседства» нет. Единственная микро-дупликация (активный напиток энричится в `enrichDrink` + повторно внутри `enrichDrinks(pool)` для SimilarRail) ничтожна. Провайдер/кэш = оверинжиниринг.

---

## Техдолг фронта: prefers-reduced-motion

- ~~**`prefers-reduced-motion` — глушить декоративную анимацию**~~ ✅ Гибрид CSS + JS:
  - **CSS** ([globals.css](frontend/src/app/globals.css)): блок `@media (prefers-reduced-motion: reduce)` прячет `.liquid-bg` (жидкие блобы) и `.app.has-scan::after` (CRT-развёртку), замораживает бесконечные keyframes у ticker (`tick`/`pulse`), auth-визуала (`authCanSpin`/`linePulse`/blob) и age-gate-блобов. Базовые fade/scale-переходы оставлены.
  - **JS** ([ThreeCans.tsx](frontend/src/widgets/three-cans/ui/ThreeCans.tsx)): 3D-банки крутятся непрерывно (idle-wobble + орбита льдинок), поэтому при reduce-motion компонент вовсе не монтирует Three.js-сцену (`matchMedia`, lazy-init + listener на смену настройки) — экономит ещё и WebGL/CPU.
  - Кроссфейд смены темы (View Transitions) уже учитывал reduced-motion с прошлого спринта.

---

## 3D-банки: мобайл-гейт + accent-привязка

- ~~**3D-банки: брекпоинт-чувствительность (не жрать батарею на мобиле)**~~ ✅ [ThreeCansLazy.tsx](frontend/src/widgets/three-cans/ui/ThreeCansLazy.tsx) гейтит через `useMinWidth(1440)` — ниже брейкпоинта возвращает `null`, поэтому `dynamic(ssr:false)`-импорт three.js (~150 КБ) даже не качается и WebGL не монтируется (не просто `display:none` — нет рендера/загрузки/rAF). Сильнее, чем просил бэклог-пункт.
- ~~**3D-банки: цвет полосок привязать к акценту**~~ ✅ [ThreeCans.tsx](frontend/src/widgets/three-cans/ui/ThreeCans.tsx) красит полоски/свет банок активным акцентом из `useTheme` (`ACCENT_MAP[accent].rgb`): левая банка = текущий акцент, правая = следующий в `ACCENT_CYCLE`. Не захардкожено. reduced-motion — статичный кадр без rAF (см. секцию выше).
- **Остаток (бэк-висяк):** заменить абстрактные банки на реальные топ-2 напитка по рейтингу — нужно поле `can_colors`/генератор + способ взять топ-2. В активном improvements (🟢).

---

## Техдолг фронта: шрифты, emoji-picker, тема, Monocraft

- ~~**Все Google Fonts грузятся всегда**~~ ✅ [layout.tsx](frontend/src/app/layout.tsx) грузит только always-load набор (JetBrains Mono / Russo One / Exo 2). Опциональные Share Tech Mono / Orbitron / Rajdhani подгружаются динамически через `ensureFontLoaded()` в [applyFont](frontend/src/shared/lib/user-preferences.ts) только когда юзер их выбрал — три неиспользуемых семейства больше не тянутся на каждый первый рендер.
- ~~**`FONT_INIT_SCRIPT` не валидирует значение шрифта**~~ ✅ Устарел — `readPrefs()` в [user-preferences.ts](frontend/src/shared/lib/user-preferences.ts) проверяет `font` против `FONTS` и падает на дефолт при мусоре. Отдельного inline-скрипта больше нет.
- ~~**Emoji-picker позиционируется только вверх**~~ ✅ [EmojiBar](frontend/src/features/emoji-reactions/ui/EmojiBar.tsx) меряет место над якорем при открытии (`getBoundingClientRect`) и флипает вниз (класс `.is-down`, [globals.css](frontend/src/app/globals.css)) когда сверху < 52px — у верхних отзывов picker больше не уезжает за viewport.
- ~~**Мусор `energos_favorites_mock` в localStorage**~~ ✅ One-shot `localStorage.removeItem('energos_favorites_mock')` на mount в [FavoritesProvider](frontend/src/shared/lib/favorites/favorites-provider.tsx).
- ~~**Monocraft.ttc — 5.9MB**~~ ✅ Сконвертирован в `.woff2` через fontTools (взят regular weight 400 из 12-шрифтовой коллекции): **5.9MB → 446KB (-92%)**. `@font-face` в [globals.css](frontend/src/app/globals.css) переведён на `format('woff2')`, исходный `.ttc` удалён.
- ~~**Анимация перехода dark↔light (flash)**~~ ✅ [theme-provider.tsx](frontend/src/shared/lib/theme/theme-provider.tsx) оборачивает смену темы в View Transitions API (кроссфейд `.35s`). Только на явном dark↔light (не первый рендер, не accent/toggle), с guard на `prefers-reduced-motion` и graceful no-op где API не поддержан.

---

## Техдолг фронта: сброс фильтров + ошибки удаления отзыва

- ~~**`sort`/`noSugarOnly` не сбрасывались при смене маршрута**~~ ✅ `SearchResetter` в [catalog-search.tsx](frontend/src/shared/lib/catalog-search.tsx) теперь сбрасывает все восемь полей контекста (добавлены `sort`, `tiers`, `priceRange`, `onlyNew`, `noSugarOnly`, `view`), а не только `search`/`searchItems`/`filterOpen`. «Сначала дороже» больше не висит после ухода со страницы.
- ~~**`deleteReviewAction` молча игнорировал ошибки**~~ ✅ Экшен в [actions.ts](frontend/src/features/submit-review/model/actions.ts) возвращает `{ error }` (с обработкой `RateLimitError` по образцу `saveReviewAction`) вместо `// ignore`; редирект только при успехе. [DrinkPage.handleDelete](frontend/src/widgets/drink-page/ui/DrinkPage.tsx) показывает `toast({ kind: 'err' })` при провале.
- ~~**`avgReview` использует `userReviews[0]` как базу**~~ ✅ Уже было исправлено ранее — `DrinkPage` считает `averageMetrics(userReviews)` и передаёт `metrics`/`count`/`rating` явными пропами в `AvgReviewCard`, без spread'а чужого отзыва. Пункт в backlog был устаревшим.

---

## Фильтрация отзывов по оценке и периоду (коммит `997a6ed`)

- ~~**Фильтрация отзывов по рейтингу и дате**~~ ✅ На странице напитка под отзывами рядом с сортировкой добавлены два `.select-min`: фильтр по оценке (Все / 5 / 4+ / 3+ / 2+ / 1+, по округлённому `calcRating`) и по периоду (всё время / год / месяц / неделя, по `created_at`). [DrinkPage.tsx](frontend/src/widgets/drink-page/ui/DrinkPage.tsx). Секция держится пока есть отзывы вообще — при пустом фильтре контролы остаются + empty-state; счётчик «N из M» при активном фильтре.

---

## Каталог: URL-пагинация, токенный поиск, скелетоны, 404 (коммит `447bd23`)

- ~~**Сохранение страницы пагинации при back-навигации**~~ ✅ `page` перенесён в URL (`?page=N`) через `useSearchParams` в [DrinkCatalog.tsx](frontend/src/widgets/drink-catalog/ui/DrinkCatalog.tsx) (state→URL one-way, init из URL — паттерн как в ComparePage). Переживает back, шарится. Главная обёрнута в `<Suspense>` ([page.tsx](frontend/src/app/page.tsx)) — требование useSearchParams.
- ~~**Остальное состояние каталога в URL**~~ ✅ (`94211f5`) Синкаются `sort`, `tiers`, `price`, `new`, `zero`, `view` — гидратация из URL при маунте + зеркалирование при изменениях. Первый write пропускается, чтобы не затереть URL дефолтами. `search` намеренно НЕ синкается — его сбрасывает `SearchResetter` при навигации. Дефолты (`sort=name`/`view=grid`/пустые фильтры) в URL не пишутся.
- ~~**Поиск независимо от порядка слов**~~ ✅ В [useFilterDrinks.ts](frontend/src/features/filter-drinks/model/useFilterDrinks.ts) подстрока заменена на токены: `split(/\s+/)` + `tokens.every(t => name.includes(t))`. «burn киви яблоко» находит «BURN Яблоко, киви».
- ~~**`loading.tsx` / Suspense-границы**~~ ✅ [app/loading.tsx](frontend/src/app/loading.tsx) — скелетон каталога (hero + sortbar + сетка из 8 карточек), `.skel` shimmer-анимация, `prefers-reduced-motion: reduce` отключает.
- ~~**`not-found.tsx` для несуществующего `?id=`**~~ ✅ [drinks/page.tsx](frontend/src/app/drinks/page.tsx) при заданном, но несуществующем id вызывает `notFound()` вместо молчаливого показа первого напитка; [drinks/not-found.tsx](frontend/src/app/drinks/not-found.tsx) — 404-страница с CTA в каталог.
- ~~**Сортировка по цене**~~ ✅ Уже была реализована ранее (таб «По цене» в SortBar + `price_asc`/`price_desc` в useFilterDrinks) — пункт был устаревшим в backlog.

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
