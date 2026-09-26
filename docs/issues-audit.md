# Сверка открытых ишью с кодом

Сверено 2026-09-26 по `main` на коммите `25c1255`. Статусы проставлены **по коду**. Финальное решение по каждому ишью принимаем после живого теста (раздел 1).

По итогам сверки уже сделано:
- закрыты [#97] (исправлено в [#266]) и [#131] (в истории репозитория ни дампов, ни `.env`);
- у [#108], [#110], [#113], [#128], [#129], [#133] метка `backend` заменена на `infra`.

Сводка: 11 можно закрывать, 5 сделаны частично, 63 актуальны.

---

## 0. Блокер старта бэка — исправлен ([#278])

На момент сверки бэк на `main` не стартовал. В `backend/config.py` было написано `DB_URL: str = Field(..., env="DATABASE_URL")`, но в pydantic v2 параметр `env` у `Field` игнорируется, поэтому значение искалось в переменной `DB_URL`. А `docker-compose.yml` и `.env.example` задают `DATABASE_URL`, и на импорте конфига бэк падал с `ValidationError: DB_URL Field required`. Сломалось в рефакторинге [#266]. CI этого не поймал, потому что джобы для бэка нет ([#233]).

Исправлено в [#278]:

```python
DB_URL: str = Field(..., validation_alias="DATABASE_URL")
```

Там же убраны остальные `env=` и дубль объявления `SECRET_KEY`. Проверено на Python 3.14.7 и чистом Postgres: миграции доходят до head, uvicorn стартует, основные эндпоинты отвечают.

---

## 1. Подготовка стенда

1. Взять свежий `main`: в нём уже есть фикс из раздела 0.
2. Создать `.env` из `.env.example`:
   - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — любые значения. `DATABASE_URL` compose соберёт сам.
   - `SECRET_KEY` — не короче 32 символов: `openssl rand -hex 32`.
   - `ALLOWED_ORIGINS=http://localhost`, `PUBLIC_URL=http://localhost`.
   - `DEPLOY_ENV=dev`. При `prod` любой curl без `Origin`/`Referer` получит 403, см. [#98].
   - `SUPABASE_*` — непустые заглушки, причём `SUPABASE_URL=http://127.0.0.1:9`, чтобы загрузка падала сразу, а не висела на таймаутах. Ключей Supabase нет, поэтому загрузка картинок закончится 500 уже **после** валидации. Для проверок [#100] и [#101] этого хватает: 400 значит, что валидация сработала, 500 — что пропустила.
3. `docker compose up -d --build`. Сайт откроется на http://localhost, API — на http://localhost/api.
4. Создать двух пользователей и админа, получить токены:

```sh
set -a; . ./.env; set +a
API=http://localhost/api
for u in alice bob admin; do
  curl -s -X POST $API/auth/register/ -H 'Content-Type: application/json' \
    -d "{\"username\":\"$u\",\"password\":\"Passw0rd1\"}"; echo
done
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "UPDATE users SET role='admin' WHERE username='admin';"
tok() { curl -s -X POST $API/auth/login/ -d "username=$1&password=Passw0rd1" | sed -E 's/.*"access_token":"([^"]+)".*/\1/'; }
A=$(tok alice); B=$(tok bob); ADM=$(tok admin)   # на чистой БД id: alice=1, bob=2, admin=3
```

5. Создать тестовый напиток (id=1):

```sh
curl -s -X POST $API/energy-drinks/ -H "Authorization: Bearer $ADM" \
  -H 'Content-Type: application/json' -d '{"name":"Test Drink 0.45л","price":99}'
```

Во всех проверках ниже подразумеваются заголовки `-H "Authorization: Bearer ..."` и `-H 'Content-Type: application/json'` там, где у запроса есть JSON-тело.

---

## 2. Сделано, можно закрывать (9)

| Ишью | Что сделано | Живая проверка |
|---|---|---|
| [#108], [#110], [#129] | cookie в `frontend/src/shared/lib/session.ts`: `secure` в проде, `sameSite: 'lax'`, `maxAge` 30 минут — столько же живёт JWT | DevTools → Application → Cookies → `auth_token`: HttpOnly, SameSite=Lax, истекает через 30 минут |
| [#51] | сортировка «По отзывам» в обе стороны (`SortBar`) | каталог → сортировка |
| [#70], [#71] | в глоссарии протокол дегустации из 4 шагов и МИН/МАКС по каждой метрике с брендом (`GlossaryPage`) | `/glossary` |
| [#72] | тикер в шапке строится из `GET /reviews/` | оставить отзыв и увидеть его в тикере |
| [#77] | кнопка «Сравнить» в hero напитка (`DrinkHero.tsx:115`) | страница напитка |
| [#42] | в футере ссылки на два Telegram-контакта | решить, хватает ли этого как обратной связи |

## 3. Неактуально (2)

- [#81] — часть про base64 устарела: фронт уже отправляет `multipart`. Часть про OOM дублирует [#96].
- [#111] — бэк авторизует по заголовку `Authorization`, а не по cookie. Cookie читает только Next, а его server actions сами сверяют `Origin`. Route handlers в `frontend/src/app` нет.

## 4. Частично (5)

- [#107] — дефолт `ALLOWED_ORIGINS` убран в [#266], но `allow_methods` и `allow_headers` по-прежнему `*`.
- [#102] — аватары пережимаются через canvas (`avatar-editor/lib/crop-output.ts`), и EXIF с них уходит. Фото напитков и заявок загружаются как есть.
- [#65] — бейдж «Топ-10%» на фронте готов, но бэк не отдаёт `is_top10`, поэтому бейдж никогда не открывается.
- [#78] — миграция не нужна: `GET /auth/me/` уже отдаёт `created_at` (подтверждено вживую 26.09). Не хватает только вывода даты на профиле.
- [#50] — префикс «Напиток энергетический» срезается только при отображении (`cleanDrinkName`), в данных он остаётся.

---

## 5. Актуально (63)

### Безопасность бэка (23)

| Ишью | Суть | Живая проверка: что сейчас → что должно быть |
|---|---|---|
| [#94] | создавать, менять и удалять напитки может любой залогиненный. **Подтверждено вживую 26.09**: обычный пользователь создал напиток и получил 201 | `POST $API/energy-drinks/` с токеном `$A` и телом `{"name":"x"}` → сейчас 201, должно быть 403 |
| [#104], [#114] | PUT напитка меняет любое поле схемы, включая `image_url` | `PUT $API/energy-drinks/1/` с `$A` и `{"name":"x","image_url":"https://example.com/p.gif"}` → `image_url` подменился |
| [#103] | PUT отзыва меняет `user_id` и `energy_drink_id` | alice создаёт отзыв (`POST $API/reviews/` с `{"energy_drink_id":1,"acidity":3,"sweetness":3,"concentration":3,"carbonation":3,"aftertaste":3,"price_quality":3}`), потом `PUT $API/reviews/{id}/` с тем же телом плюс `"user_id":2` → `GET $API/reviews/{id}/` показывает `username: bob` |
| [#95] | картинку заявки можно скачать без авторизации | создать заявку с любым файлом, затем `curl $API/add-requests/1/image` без токена → 200 |
| [#96], [#99], [#137] | файл заявки читается в память целиком, без лимита, и хранится в `bytea` | `head -c 50M /dev/urandom > big.bin; curl -F name=x -F image=@big.bin $API/add-requests/ -H "Authorization: Bearer $A"` → 200. Размер таблицы: `SELECT pg_size_pretty(pg_total_relation_size('energy_drink_add_requests'))` |
| [#100] | MIME берётся из заголовка клиента | `echo '<script>alert(1)</script>' > x.html; curl -F 'file=@x.html;type=image/jpeg' $API/energy-drinks/1/upload-image/ -H "Authorization: Bearer $ADM"` → сейчас 500 (валидация пропустила, упало на заглушке S3), должно быть 400 |
| [#101] | имя файла от клиента попадает в S3-ключ | по коду: `backend/src/database.py`, `f"{uuid4()}_{file.filename}"`. Без S3 вживую не проверить |
| [#98] | `NoDirectAccessMiddleware` обходится | при `DEPLOY_ENV=prod`: `curl $API/energy-drinks/` → 403, `curl -H 'Referer: x' $API/energy-drinks/` → 200 |
| [#106] | rate limit считается по IP контейнера Caddy, то есть общий на всех | 5 регистраций curl'ом, затем регистрация через UI в браузере → 429, хотя клиент другой. С логином то же самое: 10 входов в минуту на весь сайт |
| [#105], [#109] | JWT без отзыва и без refresh | войти в UI, скопировать `auth_token`, выйти, затем `curl $API/auth/me/ -H "Authorization: Bearer <токен>"` → 200 ещё 30 минут |
| [#115] | в схемах нет `max_length` | создать отзыв с `comment` длиной 1 МБ → 201 |
| [#134] | Swagger доступен | http://localhost/api/docs открывается |
| [#128], [#133] | нет security-заголовков и CSP | `curl -sI http://localhost/` → нет `Strict-Transport-Security`, `X-Content-Type-Options`, `Content-Security-Policy` |
| [#113] | ID Метрики зашит в код | `frontend/src/shared/ui/AnalyticsConsent/AnalyticsConsent.tsx:7` |
| [#130] | на регистрации нет капчи | форма регистрации |
| [#132] | нет `uv.lock` и аудита зависимостей | `uv.lock` прямо внесён в `.gitignore` (строка 221), поэтому `uv sync` в Dockerfile каждый раз заново резолвит версии. Фикс: убрать строку из `.gitignore`, закоммитить лок, в Dockerfile использовать `uv sync --frozen` |
| [#136] | `energy_drink_add_requests` в `User` объявлен дважды, `cascade` теряется | только по коду: удаления пользователей через API нет, вживую не проявится |
| [#138] | стиль: `Table` назван `UserFavoriteDrinks` | по коду |

### Заявки на добавление (9)

| Ишью | Суть | Живая проверка |
|---|---|---|
| [#82], [#83], [#93] | бэк не ставит и не отдаёт `created_at`, `resolved_at` нет. Фронт подставляет `new Date()` | в ответе `GET $API/add-requests/` полей дат нет, в UI после перезагрузки у заявки дата «сегодня» |
| [#84] | статус принимает любую строку, переход из финального статуса не запрещён | `PATCH $API/add-requests/1/status` с `$ADM` и `{"status":"banana"}` → 200 |
| [#85], [#92] | одобрение заявки не создаёт напиток | одобрить заявку → в каталоге новой позиции нет |
| [#86] | нет `DELETE` | `curl -X DELETE $API/add-requests/1 ...` → 404, эндпоинта нет |
| [#87] | нет сортировки, фильтра и пагинации | по коду: `get_requests` без `ORDER BY` |
| [#88] | нет rate limit на создание | 10 заявок подряд → все 200 |

### Техдолг и CI (2)

- [#80] — `EmojiBar` делает отдельный запрос на каждый отзыв. Проверка: DevTools → Network на странице напитка с N отзывами → N запросов `/emojis/`.
- [#233] — нет CI для бэка. Живой пример того, чем это оборачивается, — блокер из раздела 0.

### Продукт P0/P1 (6)

- [#40] — картинки грузятся напрямую с `*.supabase.co`. Нужна проверка с мобильного интернета в РФ, на стенде без S3 не воспроизвести. Лечится собственным хранилищем (этап 4 в `docs/backend-go-migration.md`).
- [#41] — поиск простой подстрокой: «монстр» не находит «Monster».
- [#43] — событий аналитики нет, `reachGoal` нигде не вызывается.
- [#44], [#45], [#46] — полей бренда, объёма и описания в `energy_drinks` нет. Бренд и объём фронт выдирает из названия.

### P2 (21)

Ничего из этого не сделано. Где есть задел, он указан в скобках.

[#47] (3D-банки абстрактные), [#48], [#49], [#52], [#53], [#54], [#55], [#56], [#57], [#58] (агрегация только во вкладке админки), [#59], [#60] (есть 21 ачивка, но нет XP и уровней), [#61] (есть календарь активности, но нет streak), [#62], [#63], [#66], [#73], [#74] (блок подписан «AI», а считается L2-расстояние), [#75] (сейчас топ-3 по числу отзывов), [#76] (тир вычисляется из рейтинга), [#79].

### Обсуждения (2)

[#64], [#139] (отзыв админа по-прежнему правится в `DrinkForm` в админке).

---

## 6. Попутные замечания

- Шапка на каждой странице тянет **все** отзывы через `GET /reviews/`, только чтобы построить тикер. Пагинации нет, и с ростом базы это станет узким местом.

[#40]: https://github.com/So77eZ/energos/issues/40
[#41]: https://github.com/So77eZ/energos/issues/41
[#42]: https://github.com/So77eZ/energos/issues/42
[#43]: https://github.com/So77eZ/energos/issues/43
[#44]: https://github.com/So77eZ/energos/issues/44
[#45]: https://github.com/So77eZ/energos/issues/45
[#46]: https://github.com/So77eZ/energos/issues/46
[#47]: https://github.com/So77eZ/energos/issues/47
[#48]: https://github.com/So77eZ/energos/issues/48
[#49]: https://github.com/So77eZ/energos/issues/49
[#50]: https://github.com/So77eZ/energos/issues/50
[#51]: https://github.com/So77eZ/energos/issues/51
[#52]: https://github.com/So77eZ/energos/issues/52
[#53]: https://github.com/So77eZ/energos/issues/53
[#54]: https://github.com/So77eZ/energos/issues/54
[#55]: https://github.com/So77eZ/energos/issues/55
[#56]: https://github.com/So77eZ/energos/issues/56
[#57]: https://github.com/So77eZ/energos/issues/57
[#58]: https://github.com/So77eZ/energos/issues/58
[#59]: https://github.com/So77eZ/energos/issues/59
[#60]: https://github.com/So77eZ/energos/issues/60
[#61]: https://github.com/So77eZ/energos/issues/61
[#62]: https://github.com/So77eZ/energos/issues/62
[#63]: https://github.com/So77eZ/energos/issues/63
[#64]: https://github.com/So77eZ/energos/issues/64
[#65]: https://github.com/So77eZ/energos/issues/65
[#66]: https://github.com/So77eZ/energos/issues/66
[#70]: https://github.com/So77eZ/energos/issues/70
[#71]: https://github.com/So77eZ/energos/issues/71
[#72]: https://github.com/So77eZ/energos/issues/72
[#73]: https://github.com/So77eZ/energos/issues/73
[#74]: https://github.com/So77eZ/energos/issues/74
[#75]: https://github.com/So77eZ/energos/issues/75
[#76]: https://github.com/So77eZ/energos/issues/76
[#77]: https://github.com/So77eZ/energos/issues/77
[#78]: https://github.com/So77eZ/energos/issues/78
[#79]: https://github.com/So77eZ/energos/issues/79
[#80]: https://github.com/So77eZ/energos/issues/80
[#81]: https://github.com/So77eZ/energos/issues/81
[#82]: https://github.com/So77eZ/energos/issues/82
[#83]: https://github.com/So77eZ/energos/issues/83
[#84]: https://github.com/So77eZ/energos/issues/84
[#85]: https://github.com/So77eZ/energos/issues/85
[#86]: https://github.com/So77eZ/energos/issues/86
[#87]: https://github.com/So77eZ/energos/issues/87
[#88]: https://github.com/So77eZ/energos/issues/88
[#92]: https://github.com/So77eZ/energos/issues/92
[#93]: https://github.com/So77eZ/energos/issues/93
[#94]: https://github.com/So77eZ/energos/issues/94
[#95]: https://github.com/So77eZ/energos/issues/95
[#96]: https://github.com/So77eZ/energos/issues/96
[#97]: https://github.com/So77eZ/energos/issues/97
[#98]: https://github.com/So77eZ/energos/issues/98
[#99]: https://github.com/So77eZ/energos/issues/99
[#100]: https://github.com/So77eZ/energos/issues/100
[#101]: https://github.com/So77eZ/energos/issues/101
[#102]: https://github.com/So77eZ/energos/issues/102
[#103]: https://github.com/So77eZ/energos/issues/103
[#104]: https://github.com/So77eZ/energos/issues/104
[#105]: https://github.com/So77eZ/energos/issues/105
[#106]: https://github.com/So77eZ/energos/issues/106
[#107]: https://github.com/So77eZ/energos/issues/107
[#108]: https://github.com/So77eZ/energos/issues/108
[#109]: https://github.com/So77eZ/energos/issues/109
[#110]: https://github.com/So77eZ/energos/issues/110
[#111]: https://github.com/So77eZ/energos/issues/111
[#113]: https://github.com/So77eZ/energos/issues/113
[#114]: https://github.com/So77eZ/energos/issues/114
[#115]: https://github.com/So77eZ/energos/issues/115
[#128]: https://github.com/So77eZ/energos/issues/128
[#129]: https://github.com/So77eZ/energos/issues/129
[#130]: https://github.com/So77eZ/energos/issues/130
[#131]: https://github.com/So77eZ/energos/issues/131
[#132]: https://github.com/So77eZ/energos/issues/132
[#133]: https://github.com/So77eZ/energos/issues/133
[#134]: https://github.com/So77eZ/energos/issues/134
[#136]: https://github.com/So77eZ/energos/issues/136
[#137]: https://github.com/So77eZ/energos/issues/137
[#138]: https://github.com/So77eZ/energos/issues/138
[#139]: https://github.com/So77eZ/energos/issues/139
[#233]: https://github.com/So77eZ/energos/issues/233
[#266]: https://github.com/So77eZ/energos/pull/266
[#278]: https://github.com/So77eZ/energos/pull/278
