# План переноса бэкенда на Go

Рабочий документ. Цель: переписать `backend/` (FastAPI) на Go с полным паритетом API, чтобы фронт не заметил подмены, и захостить всё самостоятельно. Параллельно это практика Go.

Статусы этапов отмечать прямо в этом файле.

---

## 0. Принципы

1. **Питоновский бэк — это референс, не мусор.** `backend/` не трогаем до cutover: по нему сверяем поведение.
2. **Спецификация — это фронт.** Бэк должен отдавать ровно то, что ждёт `frontend/src/**/api/*.ts` и `frontend/src/shared/api/http.ts`: пути, коды, формат ошибок, формат дат.
3. **Сначала контрактные тесты, потом код.** Тесты гоняются против любого бэка по URL: сначала зелёные на Python, потом на Go.
4. **Баги не переносим.** Раздел 3 — список того, что в текущем бэке сломано. Каждый пункт решается осознанно: чиним в Go (и фиксируем в контракте) или сознательно оставляем.
5. **Пишу сам.** LLM — для ревью, вопросов и объяснений, а не для генерации модулей целиком. Иначе теряется смысл практики.

---

## 1. Инвентарь текущего бэка

Стек: FastAPI, SQLAlchemy async, Alembic, Postgres 18, slowapi, pyjwt, pwdlib (argon2), boto3 → Supabase Storage (S3). Около 2.5k строк, тестов нет.

### Эндпоинты

Все пути снаружи идут с префиксом `/api`: Caddy (`server/Caddyfile`) режет `/api` через `handle_path`, бэк видит путь без префикса. **Trailing slash важен**: FastAPI на путь без слэша отвечает 307-редиректом.

| Метод | Путь | Auth | Примечание |
|---|---|---|---|
| GET | `/` | — | `{"message": "..."}` |
| GET | `/docs`, `/redoc`, `/openapi.json` | — | только при `API_DOCS=true`, иначе 404 |
| POST | `/auth/register/` | — | JSON, rate limit 5/min по IP клиента, 201 |
| POST | `/auth/login/` | — | **form-urlencoded** (`username`, `password`), rate limit 10/min по IP клиента, `{access_token, token_type}` |
| GET | `/auth/me/` | user | |
| GET | `/auth/me/favorites/` | user | `[int]` — id напитков |
| PUT | `/auth/me/favorites/{id}/` | user | 204, идемпотентно |
| DELETE | `/auth/me/favorites/{id}/` | user | 204, идемпотентно |
| GET | `/energy-drinks/` | — | `limit` (1..200, опционально), `offset` |
| GET | `/energy-drinks/{id}/` | — | |
| POST | `/energy-drinks/` | admin | 201, тело — только `name`, `price`, `no_sugar` |
| PUT | `/energy-drinks/{id}/` | admin | те же три поля; `price: null` очищает цену |
| DELETE | `/energy-drinks/{id}/` | admin | возвращает удалённый объект, удаляет картинку из S3 |
| POST | `/energy-drinks/{id}/upload-image/` | admin | multipart `file`, jpeg/png/webp/gif, ≤5 МБ; единственный способ поменять `image_url` |
| GET | `/reviews/` | — | все отзывы, без пагинации |
| GET | `/reviews/user/` | user | отзывы текущего юзера |
| GET | `/reviews/energy-drink/{id}/` | — | |
| GET | `/reviews/{id}/` | — | |
| POST | `/reviews/` | user | rate limit 5/min по IP клиента, `from_admin` берётся из роли, `comment` ≤2000 |
| PUT | `/reviews/{id}/` | owner/admin | только 6 оценок и `comment`; `comment: null` очищает |
| DELETE | `/reviews/{id}/` | owner/admin | возвращает удалённый объект |
| GET | `/reviews/{id}/emojis/` | — | |
| POST | `/reviews/{id}/emojis/?emoji=...` | user | эмодзи в **query**, 1..32 символа, 201, дубль → 400 |
| DELETE | `/reviews/{id}/emojis/?emoji=...` | user | 204 |
| POST | `/add-requests/` | user | multipart: `name` (1..80), `price`, `no_sugar`, `comment` (≤500), `image` |
| GET | `/add-requests/` | user | админ видит все, юзер — свои |
| GET | `/add-requests/{id}/image` | owner/admin | **без trailing slash**, отдаёт bytea, mime по сигнатуре; чужая заявка → 404. Браузер ходит через route handler Next `/submission-image/{id}` |
| PATCH | `/add-requests/{id}/status` | admin | **без trailing slash**, `admin_comment` ≤500 |

Отзыв в ответе содержит `username` (join с users). Заявка — `user_name`.

### Таблицы

`users`, `energy_drinks`, `energy_drinks_reviews`, `review_emojis`, `energy_drink_add_requests`, таблица связи избранного (см. `backend/src/models/favorites.py`). У всех `id serial`, `created_at`/`updated_at` — `timestamp without time zone`, nullable, пишется UTC.

### Конфиг (env)

`SECRET_KEY` (≥32 символов), `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ACCESS_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_BUCKET_NAME`, `SUPABASE_REGION`, `ALLOWED_ORIGINS` (через запятую), `PUBLIC_URL`, `DEPLOY_ENV`, `INTERNAL_API_SECRET` (необязательный, общий с фронтом), `API_DOCS` (bool, по умолчанию false).

---

## 2. Детали контракта, которые легко сломать

- **Формат ошибок.** Всегда `{"detail": ...}`. Для бизнес-ошибок `detail` — строка. Для 422 (валидация) `detail` — массив объектов в стиле pydantic; фронт (`parseError` в `http.ts`) берёт `ctx.error` или `msg` и срезает префикс `Value error, `. Минимум для Go: `[{"loc": [...], "msg": "...", "type": "..."}]` с человеческим `msg` на русском, как сейчас в валидаторах пароля/логина.
- **Локализация.** Тексты ошибок зависят от `Accept-Language`: если содержит `ru`, то русский, иначе английский (`backend/src/localization.py`). Перенести словарь как есть.
- **Коды статусов.** Фронт завязан на 401 (→ `SessionExpiredError` и редирект на логин) и 429 (→ `RateLimitError`). 401 при логине тоже отдаёт `WWW-Authenticate: Bearer`.
- **Даты.** Pydantic сериализует naive datetime как `2026-01-01T12:00:00.123456` — **без `Z`** и без таймзоны. `time.Time` в Go по умолчанию даёт `...Z`. Нужен свой тип с `MarshalJSON`, или сначала проверить, что фронт парсит оба варианта, и тогда отдавать RFC3339 с `Z` (так правильнее).
- **Числа.** `price` и метрики отзывов — float. `null` в ответе, а не отсутствие поля (pydantic отдаёт все поля).
- **204.** Пустое тело, без `Content-Type: application/json`.
- **JWT.** HS256, `sub` = username, `exp` = +30 минут, refresh нет. Токен хранит Next в httpOnly cookie и шлёт бэку как `Authorization: Bearer`.
- **Пароли.** pwdlib `recommended()` — argon2id в PHC-формате (`$argon2id$v=19$m=...,t=...,p=...$salt$hash`). Если нужна совместимость со старыми хешами, Go должен парсить PHC-строку и брать параметры из неё. Прод-данных нет, так что это нужно только для локальных дампов; всё равно сделать, это полезное упражнение.
- **`NoDirectAccessMiddleware`.** В `prod` запрос без `Origin` и `Referer` получает 403. SSR-запросы Next ставят `Origin` вручную (`http.ts`). Это не защита (заголовки подделываются тривиально), но поведение нужно либо повторить, либо осознанно выкинуть.
- **CORS.** `allow_credentials=true`, origins из `ALLOWED_ORIGINS`, все методы и заголовки.
- **PUT — не частичный.** С 27.09 PUT напитка и отзыва принимает фиксированный набор редактируемых полей и записывает их все, `null` очищает поле. Лишние поля игнорируются (не 422). Различать «нет поля» и `null` не нужно.

### Исправлено в Python 27.09 — Go обязан повторить

Эти дыры закрыты в Python-бэке до переезда. На каждую строку нужен контрактный тест (этап 1): сначала он зелёный на Python, потом на Go. Иначе исправление легко потерять при переписывании.

| Поведение | PR | Где в Python | Контрактный тест |
|---|---|---|---|
| Менять каталог может только админ: POST, PUT, DELETE напитка и upload-image | #304 | `get_current_admin` в `src/api/auth.py` | user → 403, без токена → 401, admin → 2xx |
| POST и PUT напитка принимают только `name` (1..200), `price`, `no_sugar`; `image_url`, `id`, даты из тела игнорируются | #306 | `EnergyDrinkWriteSchema` | тело с `image_url` и `id` → в ответе `image_url` прежний, `id` серверный |
| PUT напитка: `price: null` очищает цену | #306 | там же | PUT с `null` → `price: null` |
| PUT отзыва меняет только 6 оценок и `comment`; `user_id`, `energy_drink_id`, `from_admin` игнорируются | #305 | `UpdateEnergyDrinkReviewSchema` | PUT с чужим `user_id` → автор не меняется |
| PUT отзыва без оценки → 422, `comment: null` очищает текст | #305 | там же | |
| Картинку заявки видят только автор и админ, чужим — 404, без токена — 401 | #307 | `get_request_image` | три кейса |
| Лимиты длины: отзыв ≤2000, напиток 1..200, заявка 1..80 и ≤500, `admin_comment` ≤500, эмодзи 1..32 | #308 | схемы и `Form`/`Query` | граница проходит, граница+1 → 422 |
| Rate limit по IP клиента: `X-Client-IP` учитывается только вместе с верным `X-Internal-Secret` (`INTERNAL_API_SECRET`, сравнение за постоянное время), иначе IP соединения | #302 | `client_ip_key` в `src/rate_limiter.py` | разные `X-Client-IP` с секретом — разные счётчики; с неверным секретом — общий |
| Swagger (`/docs`, `/redoc`, `/openapi.json`) только при `API_DOCS=true` | #313 | `main.py` | без флага → 404 |

Фронт под это уже подстроен: шлёт `X-Client-IP` и секрет из server actions (`shared/lib/client-ip.ts`), не отправляет `user_id` и `image_url` в PUT, грузит картинку заявки через `/submission-image/{id}`. Go не должен требовать от фронта ничего сверх этого.

---

## 3. Найденные баги и дыры в текущем бэке

Решение по каждому принять до реализации соответствующего модуля. По умолчанию — чинить.

1. ~~**Любой залогиненный юзер может создать, изменить или удалить напиток и заменить ему картинку.**~~ **Исправлено в #304, см. раздел 2.** Проверки `role == admin` нет (`backend/src/api/energy_drink.py`). Самая серьёзная дыра. В Go — только admin. Проверить, что фронт шлёт эти запросы только из админки.
2. ~~**`PUT /reviews/{id}/` позволяет поменять `user_id` и `energy_drink_id`.**~~ **Исправлено в #305.** Из обновления исключены только `id`, даты, `username` и `from_admin`. Можно «подарить» свой отзыв другому юзеру или перенести на другой напиток. В Go эти поля не изменяются.
3. ~~**Rate limit почти наверняка общий на всех.**~~ **Исправлено в #302** через `X-Client-IP` с общим секретом: запросы к бэку идут от сервера Next, а не от браузера, поэтому одного `X-Forwarded-For` от прокси недостаточно.
4. ~~**`GET /add-requests/{id}/image` без авторизации.**~~ **Исправлено в #307.** Перебором id можно выкачать все картинки из заявок. Сделать: владелец или admin.
5. **Картинка заявки без ограничений.** Нет проверки типа и размера, всё пишется в `bytea` в Postgres. Лимит 5 МБ и whitelist типов, как у напитков. Хранение лучше перевести в то же хранилище, что и картинки напитков (см. этап 7).
6. **`PATCH /add-requests/{id}/status` принимает любую строку.** Валидировать по `pending` / `approved` / `rejected`. Проверить, создаёт ли что-то напиток при одобрении (похоже, фронт делает это отдельным `POST /energy-drinks/`). Возможно, стоит сделать одобрение атомарным на бэке.
7. **Эмодзи — любая строка** (длина ограничена 1..32 в #308), уникальность (review, user, emoji) проверяется только в коде, возможна гонка. В Go: ограничить длину (или whitelist из `frontend/src/entities/review/model/emoji-types.ts`), добавить уникальный индекс в БД, ловить `23505`.
8. **Регистрация: гонка на username.** Проверка и вставка идут в разных сессиях, при коллизии будет 500 от unique constraint. В Go ловить `23505` и отдавать 400 `username_taken`.
9. **Нет пагинации** у `GET /reviews/`, `GET /reviews/energy-drink/{id}/`, `GET /add-requests/`, а у `GET /energy-drinks/` limit необязательный. Для паритета оставить как есть, но заложить `limit`/`offset`, чтобы потом включить.
10. **Утечка деталей ошибок.** `upload_image` возвращает `str(e)` от boto3 клиенту. В Go логировать внутрь, клиенту отдавать общий текст.
11. **Имя файла от клиента попадает в S3-ключ** (`{uuid}_{filename}`). Использовать только `uuid` + расширение по реальному mime.
12. **Нет способа создать админа**, кроме ручного `UPDATE` в БД. Добавить CLI-команду `energos admin create/promote <username>`.
13. **Удаление напитка.** Проверить, что происходит с его отзывами и избранным (FK без `ON DELETE CASCADE` даст 500). Решить явно: каскад или запрет.
14. Мелочи: `SECRET_KEY` объявлен в `config.py` дважды, пакет `supabase` в зависимостях не используется.

---

## 4. Стек

| Задача | Выбор | Почему |
|---|---|---|
| HTTP | stdlib `net/http` (роутинг Go 1.22+) | методы и `{id}` в паттернах есть из коробки, для практики лучше без фреймворка |
| БД | `pgx/v5` + `sqlc` | типобезопасный SQL без ORM, пишешь SQL руками |
| Миграции | `goose` | SQL-файлы, можно встроить через `embed` |
| Конфиг | `caarlos0/env` или руками через `os.Getenv` | мало переменных |
| JWT | `golang-jwt/jwt/v5` | |
| Пароли | `golang.org/x/crypto/argon2` | PHC-парсинг написать самому |
| Валидация | руками или `go-playground/validator` | руками полезнее: полей мало |
| Rate limit | `golang.org/x/time/rate` + map по IP с очисткой | задача на конкурентность, хорошая практика |
| S3 | `aws-sdk-go-v2` или `minio-go` | |
| Логи | `log/slog` (JSON) | stdlib |
| Тесты | `testing` + `testcontainers-go` (Postgres) | интеграционные тесты на реальной БД |
| Линтер | `golangci-lint` | |

---

## 5. Структура `backend-go/`

```
backend-go/
  cmd/
    api/main.go            # HTTP-сервер
    energos/main.go        # CLI: migrate, admin create/promote
  internal/
    config/                # загрузка и валидация env
    http/                  # роутер, middleware (cors, auth, ratelimit, logging, recover, origin-check)
      handlers/            # auth, drinks, reviews, emojis, favorites, addrequests
      respond/             # JSON-ответы, формат ошибок {"detail": ...}, 422
    auth/                  # jwt, argon2
    i18n/                  # словарь сообщений ru/en
    storage/               # интерфейс Storage + реализации (fs, s3)
    db/
      migrations/          # goose *.sql
      queries/             # *.sql для sqlc
      sqlc/                # сгенерированный код
    domain/                # типы, роли, статусы
  contract/                # openapi.json из FastAPI, schema.sql
  Dockerfile
  sqlc.yaml
  go.mod
```

---

## 6. Тестирование

- **Контрактные тесты** (главные). Отдельный набор HTTP-тестов, `BASE_URL` из env. Удобно писать на Go (`contract_test` с build-тегом) или на Playwright `request` (он уже есть во `frontend/`). Покрытие: каждый эндпоинт, happy path, 401/403/404/422/429, формат тел ошибок, trailing slash. Прогнать против Python и зафиксировать. Где поведение сознательно меняется (раздел 3), тест пишется под новое поведение и помечается.
- **Юнит-тесты** в Go: argon2/PHC, JWT, валидация, i18n, rate limiter, определение mime.
- **Интеграционные**: репозитории через testcontainers.
- **E2E фронта** (`frontend/e2e`) прогнать против docker-compose с Go-бэком: финальная проверка перед cutover.

---

## 7. Этапы

Каждый этап заканчивается зелёными контрактными тестами на свою часть.

### Этап 0. Подготовка — [ ]
- [ ] Поднять текущий стек локально (`docker compose up`), завести `.env` по `.env.example`.
- [ ] Выгрузить `openapi.json` из FastAPI в `backend-go/contract/`.
- [ ] Выгрузить схему: `pg_dump --schema-only` → `backend-go/contract/schema.sql`.
- [ ] Выписать из фронта все вызовы API (`frontend/src/**/api/*.ts`, `features/**/actions.ts`) и сверить с таблицей из раздела 1.
- [ ] По каждому пункту раздела 3 записать решение.

### Этап 1. Контрактные тесты против Python — [ ]
- [ ] Каркас тестов, фикстуры (регистрация юзера, получение токена, промоут в админа через SQL).
- [ ] Тесты на все эндпоинты. Зелёные на Python-бэке.

### Этап 2. Каркас Go-сервиса — [ ]
- [ ] `go mod init`, конфиг с валидацией (`SECRET_KEY` ≥32 и т.д.), fail-fast на старте.
- [ ] Подключение к БД через `pgxpool`, graceful shutdown (`signal.NotifyContext` + `srv.Shutdown`).
- [ ] goose: первая миграция = `schema.sql` плюс фиксы схемы (уникальный индекс эмодзи, каскады).
- [ ] Middleware: request id, логирование (slog), recover, CORS, origin-check, таймауты сервера (`ReadHeaderTimeout` и т.д.), `MaxBytesReader`.
- [ ] Пакет `respond`: JSON, ошибки `{"detail"}`, 422 в формате pydantic, i18n.
- [ ] `GET /` и `GET /healthz` (проверяет БД).
- [ ] Dockerfile (multi-stage, итоговый образ distroless или scratch), сервис в `docker-compose.yml` рядом со старым.

### Этап 3. Auth — [ ]
- [ ] argon2id + PHC-парсинг (совместимость с pwdlib).
- [ ] JWT HS256, `sub`/`exp`, middleware `RequireUser` / `RequireAdmin`, юзер в `context`.
- [ ] `register` (валидация логина и пароля с теми же текстами), `login` (form-urlencoded), `me`.
- [ ] Rate limiter по реальному IP клиента: `X-Client-IP` + `X-Internal-Secret`, как в #302.
- [ ] CLI `energos admin create/promote`.

### Этап 4. Напитки + хранилище картинок — [ ]
- [ ] Интерфейс `Storage` (`Put`, `Delete`, `URL`) поверх S3 API, провайдер задаётся env (#296). Картинки отдаются с собственного домена (#40).
- [ ] CRUD напитков, частичный PUT, пагинация. **Изменения — только admin.**
- [ ] Загрузка картинки: WebP/PNG/JPEG по содержимому (`http.DetectContentType`), лимит 512 КБ с потоковым чтением и 413 (#296), ключ = uuid + расширение.
- [ ] Удаление напитка с картинкой; решение по каскаду.

### Этап 5. Отзывы, эмодзи, избранное — [ ]
- [ ] Отзывы: CRUD, `username` через JOIN, `from_admin` из роли, запрет смены `user_id`/`energy_drink_id`, валидация метрик 1..5.
- [ ] Эмодзи: add/remove/list, уникальность на уровне БД.
- [ ] Избранное: идемпотентные PUT/DELETE (`INSERT ... ON CONFLICT DO NOTHING`).

### Этап 6. Заявки на добавление — [ ]
- [ ] Создание (multipart), список (свои или все для админа), смена статуса с валидацией.
- [ ] Картинка заявки: доступ владельцу и админу, лимиты. Решить, переносить ли хранение из `bytea` в `Storage`.
- [ ] Решить, делать ли одобрение атомарным (создание напитка в той же транзакции).

### Этап 7. Паритет и переключение — [ ]
- [ ] Все контрактные тесты зелёные на Go.
- [ ] E2E фронта зелёные на compose с Go-бэком.
- [ ] Caddy: `/api/*` → Go-бэк.
- [ ] Удалить `backend/`, переименовать `backend-go/` → `backend/`, обновить CI, README, `.env.example`.

### Этап 8. После паритета — [ ]
- [ ] Эндпоинты аватаров `/auth/me/avatar` (POST, DELETE, `/preset`). Фронт уже ждёт их: `TODO(backend #10)` в `frontend/src/features/avatar-editor/`.
- [ ] Включить пагинацию на фронте.
- [ ] Refresh-токены или продление сессии (сейчас 30 минут и выкидывает).
- [ ] Агрегаты рейтинга на стороне БД, если фронт считает их сам (проверить).

---

## 8. Self-host

- [ ] **VPS**: 1–2 vCPU, 2 ГБ RAM хватит с запасом. Docker + compose.
- [ ] **Домен и TLS**: Caddy получает сертификат сам. Поменять `:80` в `Caddyfile` на домен, открыть 80/443.
- [ ] **Секреты**: `.env` только на сервере, права `600`, новый `SECRET_KEY` (`openssl rand -hex 32`). Старые Supabase-ключи из репо/истории, если где-то засвечены, считать скомпрометированными.
- [ ] **Картинки**: локальный volume + раздача через Caddy. S3-совместимое хранилище (Garage, SeaweedFS) — только если понадобится масштаб или CDN; интерфейс `Storage` это позволит.
- [ ] **Бэкапы** (обязательно, до запуска):
  - `pg_dump` по cron раз в сутки, ротация (7 дневных + 4 недельных);
  - копия вне сервера (другой VPS, S3 у провайдера, restic/rclone);
  - то же для volume с картинками;
  - **один раз проверить восстановление** из бэкапа на чистой машине.
- [ ] **Postgres наружу не публиковать**. В текущем compose портов нет, так и оставить.
- [ ] **Обновления**: `unattended-upgrades` на хосте, SSH только по ключу, `ufw` (22/80/443).
- [ ] **Мониторинг**: внешний uptime-чекер на `/api/healthz`, логи через `docker compose logs` (при желании Loki/Grafana позже).
- [ ] **Деплой**: на старте хватит `git pull && docker compose up -d --build`. Потом — GitHub Actions: собрать образ → GHCR → на сервере `docker compose pull && up -d`.
- [ ] **Миграции при старте**: `energos migrate up` перед запуском API (как сейчас `migration_bootstrap`) или отдельным одноразовым сервисом в compose.

---

## 9. CI

- [ ] Job для `backend-go/`: `go vet`, `golangci-lint`, `go test ./...` (с Postgres через testcontainers или service container), `sqlc diff` (сгенерированный код не разошёлся с SQL).
- [ ] Job контрактных тестов: поднять compose с Go-бэком, прогнать тесты.
- [ ] Dependabot для `gomod`.
- [ ] CodeQL уже есть — добавить язык `go`.

---

## 10. Риски

- **Тихие расхождения формата** (даты, `null`, коды ошибок) ломают фронт незаметно. Лечится только контрактными тестами.
- **Затянутый параллельный режим.** Два бэка дольше пары месяцев — это двойная поддержка. В Python-бэк в это время только критичные фиксы.
- **Скоуп-крип.** Новые фичи (аватары и т.д.) — только после паритета, иначе не будет точки сравнения.
