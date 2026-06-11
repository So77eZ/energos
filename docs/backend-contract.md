# Бэкенд-контракт: что фронту нужно от API

Документ для бэкендера. Каждый пункт — что фронт хочет, точный shape, зачем, и где
на фронте «висячий коннектор» (место, готовое принять новый формат). Фронт пишется
отдельно; это спека, чтобы реализовать бэк не гадая.

Статусы фронта на момент написания (ветки): FSD-рефактор, перф-правки и
lazy-картинки уже влиты в `main`.

---

## #3 — Агрегаты рейтинга в каталоге (убрать «тянем все отзывы»)

**Приоритет: 🔴 высокий (самый крупный выигрыш на масштабе).**

### Проблема

Главная (`frontend/src/app/page.tsx`) и страница напитка
(`frontend/src/widgets/drink-page/ui/DrinkPage.tsx`) фетчат **всю таблицу отзывов**
через `reviewApi.list()` → `GET /api/reviews/`, только чтобы посчитать на клиенте
средний рейтинг / число отзывов / усреднённые метрики каждого напитка
(`frontend/src/entities/drink/lib/enrich.ts`, функция `enrichDrinks`).

На масштабе это: жирный RSC-пейлоад (все отзывы летят в HTML главной) + фуллскан
таблицы отзывов на каждый рендер каталога. Растёт линейно с числом отзывов.

### Что добавить на бэке

Расширить `EnergyDrinkSchema` (`backend/src/schemas/energy_drink.py`)
вычисляемыми агрегатами — считать в SQL (`AVG`/`COUNT GROUP BY energy_drink_id`),
не в Python-цикле.

Текущая схема:
```python
class EnergyDrinkSchema(BaseModel):
    id: int | None
    name: str
    price: float | None
    image_url: str | None
    no_sugar: bool
    created_at: datetime | None
    updated_at: datetime | None
```

Добавить:
```python
    rating: float | None          # средний calcRating по отзывам; null если отзывов нет
    review_count: int             # число отзывов
    metrics: MetricsSchema | None # усреднённые 6 метрик; null если отзывов нет
```

где `MetricsSchema` (можно переиспользовать поля из ReviewSchema):
```python
class MetricsSchema(BaseModel):
    acidity: float
    sweetness: float
    concentration: float
    carbonation: float
    aftertaste: float
    price_quality: float
```

**Важная деталь — правило агрегации (фронт делает так сейчас, повторить 1:1):**
если у напитка есть отзыв с `from_admin = true`, то `rating` и `metrics` берутся
**только из админ-отзыва** (он переопределяет). Иначе — среднее по всем отзывам.
(См. `aggregateMetrics`/`aggregateRating` в `enrich.ts`.) `review_count` — всегда
полное число отзывов.

`rating` округляется до 0.1 (как `Math.round(avg * 10) / 10` на фронте).

### Ответ `GET /api/energy-drinks/` (пример элемента)

```json
{
  "id": 12,
  "name": "BURN Яблоко, киви 0.45 л",
  "price": 89.9,
  "image_url": "https://.../burn.png",
  "no_sugar": false,
  "created_at": "2026-05-01T10:00:00",
  "updated_at": null,
  "rating": 4.3,
  "review_count": 17,
  "metrics": { "acidity": 3.2, "sweetness": 4.1, "concentration": 3.8,
               "carbonation": 4.5, "aftertaste": 3.0, "price_quality": 4.0 }
}
```

### Коннектор на фронте (что меняется после)

- Каталог (`page.tsx`) перестаёт звать `reviewApi.list()` вообще — берёт
  `rating`/`review_count`/`metrics` прямо из напитка. `enrichDrinks` сводится к
  вычислению производных (tier, blend-цвет, isNew) из этих полей.
- Страница напитка всё ещё грузит отзывы конкретного напитка
  (`GET /api/reviews/energy-drink/{id}/`) для списка — это нормально, там пагинация.
  Но «средний» блок берёт из агрегата.

### Открытый вопрос к бэку

Считать агрегаты на лету в запросе (подзапрос/JOIN) или денормализовать в колонки
`energy_drinks.rating`/`review_count` с пересчётом при создании/удалении отзыва?
На текущих объёмах — на лету проще. Денормализация — если каталог станет горячим.
Решение за тобой, фронту всё равно.

---

## #4 — Emoji-реакции: убрать N+1

**Приоритет: 🟡 средний.**

### Проблема

`EmojiBar` (`frontend/src/features/emoji-reactions/ui/EmojiBar.tsx:42`) фетчит
реакции **на mount, по одному запросу на каждый отзыв** —
`GET /api/reviews/{id}/emojis/`. На странице напитка с 20 отзывами это 20
параллельных GET'ов.

### Что добавить на бэке

Класть агрегат реакций прямо в `EnergyDrinkReviewSchema`
(`backend/src/schemas/reviews.py`), чтобы он приходил вместе со списком отзывов
(`GET /api/reviews/energy-drink/{id}/`).

Добавить поле:
```python
    emoji_summary: list[EmojiSummaryItem] = []
```
```python
class EmojiSummaryItem(BaseModel):
    emoji: str       # emoji_unicode
    count: int       # сколько всего таких реакций
    mine: bool       # поставил ли текущий юзер (если есть auth-контекст; иначе false)
```

`mine` требует знания текущего юзера. Список отзывов сейчас публичный (без auth).
Варианты: (а) если в запросе есть валидный токен — заполнять `mine`, иначе `false`;
(б) отдавать `user_ids: list[int]` вместо `mine`, фронт сам сверит со своим id.
**Фронту удобнее вариант (а)** — `mine: bool` готов к рендеру. Но (б) тоже ок.

### Ответ (фрагмент отзыва)

```json
{
  "id": 88, "energy_drink_id": 12, "user_id": 5, "comment": "огонь",
  "acidity": 4, "sweetness": 3, "...": "...",
  "emoji_summary": [
    { "emoji": "🔥", "count": 4, "mine": true },
    { "emoji": "👍", "count": 2, "mine": false }
  ]
}
```

### Коннектор на фронте (что меняется после)

- `EmojiBar` принимает `initialReactions` пропом (или `initialSummary`) и **не
  дёргает API на mount** — убирается `useEffect`-фетч на `EmojiBar.tsx:42`.
- Toggle-реакции (`POST`/`DELETE /api/reviews/{id}/emojis/`) остаются как есть —
  оптимистичный апдейт локального стейта.

---

## #5 — Картинки: прокси через свой origin (+ открыть next/image)

**Приоритет: 🔴 высокий для РФ-мобайла (картинки не грузятся), 🟡 для перфа.**

### Проблема

`image_url` хранится как **абсолютный Supabase-URL**
(`backend/src/database.py`, `SupabaseService.upload_image`), фронт рендерит
`<img src={drink.image_url}>` напрямую на `supabase.co`. Supabase = AWS → режется
российскими мобильными операторами → на мобиле по сотовой картинки не грузятся
(десктоп/VPN/кэш тянет). Также нельзя включить `next/image`-оптимизацию (внешний
неконтролируемый домен).

Полная диагностика — в `improvements.md` (раздел «Фото напитков не грузятся»).

### Что сделать на бэке/инфре

Зависит от того, **достаёт ли сам сервер (Caddy/backend) Supabase**:

**Вариант A — сервер достаёт Supabase (VPS за рубежом / есть обход):** прокси, без
миграции данных.
- В `server/Caddyfile` добавить роут, отдающий объекты Supabase через свой origin:
  ```caddy
  handle_path /img/* {
      reverse_proxy https://<project>.supabase.co {
          header_up Host <project>.supabase.co
          rewrite * /storage/v1/object/public/<bucket>{uri}
      }
  }
  ```
- `image_url` хранить/отдавать как относительный `/img/<file_name>` вместо
  абсолютного Supabase-URL (либо переписывать на отдаче в API).
- Существующие записи — миграцией заменить префикс на `/img/`.
- Итог: браузер грузит `https://<свой-домен>/img/<key>`, Caddy ходит в Supabase
  server-side.

**Вариант B — сервер в РФ и тоже не достаёт Supabase:** переезжать с Supabase
(Yandex Object Storage / VK Cloud — S3-совместимы, `boto3` уже используется) или
локальное хранилище (`/uploads`-том, отдаёт Caddy). Детали — в `improvements.md`.

**Решающий вопрос до старта:** где хостится прод и достаёт ли сервер Supabase.

### Коннектор на фронте (что меняется после)

- Если `image_url` станет относительным (`/img/...` или `/uploads/...`) — фронт
  ничего не меняет, `<img src>` работает как есть (свой origin).
- После того как картинки на своём origin — фронт сможет ввести `next/image`
  (авто-resize/webp/srcset/lazy) с `remotePatterns` на свой домен. Это отдельная
  фронт-задача, разблокируется этим пунктом.

---

## #7 — JWT / безопасность auth

**Приоритет: 🔴 высокий (`SECRET_KEY`), 🟠 средний (refresh/revocation).**

Чисто бэкенд. Текущая реализация — `backend/src/auth.py` + `backend/config.py`.
Фронт хранит токен в httpOnly + `SameSite=Lax` cookie (`frontend/src/shared/lib/session.ts`),
менять там по этим пунктам нечего (cookie-флаги уже подтянуты на фронте отдельно).

### 🔴 `SECRET_KEY` дефолтит в пустую строку

[`backend/config.py:12`](../backend/config.py#L12) — `SECRET_KEY: str = os.getenv("SECRET_KEY", "")`.
Если переменная не задана в проде → JWT подписывается **пустым ключом** → кто угодно
кует валидный токен (в т.ч. с `sub` админа). Pydantic не валидирует обязательность.

**Фикс:** `SECRET_KEY: str` без дефолта + `@field_validator` с `len(v) >= 32`, падать
на старте если не задан/короткий. Аналогично прогнать по `DB_URL`/`SUPABASE_*`.

### 🟠 Нет refresh-токена + нет revocation

[`backend/src/auth.py:11`](../backend/src/auth.py#L11) — `ACCESS_TOKEN_EXPIRE_MINUTES = 30`,
HS256, единственный access-токен. Refresh нет, blacklist нет.
- Украденный токен валиден все 30 мин.
- Logout на фронте чистит cookie, но серверно токен живёт до `exp` (нет отзыва).

**Фикс:** короткий access (~15 мин) + refresh-токен с записью в БД (отзываемый);
`POST /api/auth/refresh` обновляет access; logout удаляет refresh из БД.
Опц. — `jti` + Redis-blacklist для мгновенного отзыва access.

**Коннектор на фронте после refresh:** `session.ts` сейчас держит cookie ровно 30 мин
(= текущий `exp`, чтобы не было «зомби»-сессии). Когда появится refresh — фронт добавит
тихий refresh-вызов и продлит cookie/сессию; до тех пор юзер перелогинивается раз в 30 мин.

### 🟡 Нет `iss` / `aud` claims

[`backend/src/auth.py:35`](../backend/src/auth.py#L35) — `verify_token` проверяет только
подпись + `exp` + наличие `sub`. Токен из dev пройдёт в прод при совпадении `SECRET_KEY`.

**Фикс:** добавить `iss="energos"`, `aud=<DEPLOY_ENV>` в `create_access_token`,
проверять оба в `jwt.decode(..., audience=, issuer=)`.

### ✅ Что на фронте уже сделано (этот PR)

- `secure`-флаг cookie: было условие на `NEXT_PUBLIC_ORIGIN` (хрупко) → теперь
  `process.env.NODE_ENV === 'production'`.
- `maxAge` cookie: было 7 дней при `exp=30мин` (рассинхрон, «зомби»-сессия) →
  теперь 30 мин = `exp`.

---

## Сводка приоритетов

| # | Что | Приоритет | Блокирует на фронте |
|---|-----|-----------|---------------------|
| #3 | Агрегаты рейтинга в `EnergyDrinkSchema` | 🔴 | убрать фетч всех отзывов в каталоге |
| #5 | Прокси картинок на свой origin | 🔴 (РФ-мобайл) | загрузку фото на мобиле + `next/image` |
| #4 | `emoji_summary` в `EnergyDrinkReviewSchema` | 🟡 | N+1 фетч реакций |
| #7 | JWT: `SECRET_KEY` без дефолта, refresh-токен, `iss`/`aud` | 🔴/🟠 | — (бэк-only; фронт cookie уже укреплён) |
