# API Energos

Документ описывает API, реализованный в `backend/api`. API построено на
FastAPI, использует JWT Bearer-аутентификацию и версионируется через префикс
`/v1`. Актуально для ветки `mvp-fixes` (#340, 19.10.2026).

## Базовые URL

- При прямом обращении к приложению: `http://<host>/v1`
- Через reverse proxy проекта: `https://<host>/api/v1`
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/openapi.json`

В таблицах ниже используется внешний URL с префиксом `/api/v1`. При прямом
обращении к приложению префикс `/api` нужно убрать. Маршруты с завершающим `/`
поддерживаются FastAPI; при его отсутствии FastAPI может вернуть redirect.

Caddy (`server/Caddyfile`) проксирует `/api` на бэкенд только при
`DEPLOY_ENV=dev`. В остальных окружениях браузер до API не достаёт: фронт
(Next.js) ходит на бэкенд сам, по адресу из `API_ORIGIN`
(`http://backend:8000`), а картинки напитков отдаёт собственным маршрутом
`/drink-image/{id}`.

## Общие правила

### Аутентификация

Для защищённых маршрутов передавайте токен из `POST /auth/login`:

```http
Authorization: Bearer <access_token>
```

Регистрация, вход, сброс пароля и подтверждение e-mail используют стандартные
маршруты и схемы FastAPI Users. Время жизни токена — `TOKEN_LIFETIME_SECONDS`.
В самом токене только `sub`, `aud` и `exp`: e-mail, признак администратора и
подтверждения e-mail нужно получать через `GET /auth/me`.

Права проверяются так:

- **подтверждённый пользователь** — активный пользователь с
  `is_verified=true`, иначе `403` с кодом `FORBIDDEN` и сообщением
  `"User account is not verified"`;
- **администратор** — активный пользователь с `is_superuser=true`, иначе `403`
  с кодом `FORBIDDEN` и сообщением `"Admin privileges required"`. Поля `role` у
  пользователя больше нет. Администратор не освобождается от проверки
  подтверждения e-mail.

### Пагинация и сортировка

Список напитков (`GET /energy-drinks/`) отдаётся целиком, без параметров:
фильтры, сортировка и разбивка на страницы делаются на фронте.

Списки отзывов принимают `limit` (по умолчанию `20`), `offset` (по умолчанию
`0`) и `order_by` (по умолчанию `id`); верхней границы `limit` нет. Отзывы
напитка принимают ещё `order_direction` (`asc` по умолчанию или `desc`). Имя
несуществующего поля в `order_by` даёт `422` с кодом `UNPROCESSABLE_ENTITY`.

### Ошибки

Ошибки возвращаются в формате:

```json
{"error": {"code": "REVIEW_ALREADY_EXISTS", "message": "You have already submitted a review for this energy drink"}}
```

- `code` — машинный код (список — `backend/core/error_codes.py`): общие
  `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
  `UNPROCESSABLE_ENTITY`, `INTERNAL_ERROR`, и предметные `ENERGY_DRINK_NOT_FOUND`,
  `REVIEW_NOT_FOUND`, `IMAGE_NOT_FOUND`, `USER_NOT_FOUND`, `EMAIL_ALREADY_EXISTS`,
  `USERNAME_ALREADY_EXISTS`, `INVALID_PASSWORD`, `REVIEW_NOT_OWNER`,
  `REVIEW_ALREADY_EXISTS`. Фронт переводит сообщения по коду, а не по тексту;
- `message` — текст на английском;
- при ошибке валидации (`422`, код `VALIDATION_ERROR`) есть ещё `fields` —
  список ошибок Pydantic; при битом JSON — `400` с кодом `INVALID_JSON`;
- ошибки fastapi-users (вход, битые токены подтверждения и сброса) приходят с
  кодом `HTTP_<статус>`, а их собственный код лежит в `message`
  (`RESET_PASSWORD_BAD_TOKEN`, `VERIFY_USER_BAD_TOKEN`,
  `VERIFY_USER_ALREADY_VERIFIED`); неверный логин или пароль — `401` с кодом
  `BAD_CREDENTIALS`;
- непойманное исключение — `500` с кодом `INTERNAL_ERROR`.

Основные статусы:

- `400` — некорректный JSON, битый токен подтверждения/сброса;
- `401` — отсутствует/неверен токен либо неверные учётные данные;
- `403` — недостаточно прав, пользователь не подтверждён, чужой отзыв;
- `404` — объект не найден;
- `409` — конфликт: занятый e-mail или `username` при регистрации, повторный
  отзыв того же пользователя на напиток;
- `413 CONTENT_TOO_LARGE` — тело запроса больше `MAX_ENERGY_DRINK_IMAGE_SIZE`
  (ограничение действует на все запросы);
- `422` — ошибка валидации параметров или тела запроса;
- `429` — превышен rate limit.

## Аутентификация (`/auth`)

| Метод и путь | Доступ | Тело запроса | Ответ |
| --- | --- | --- | --- |
| `POST /auth/register` | публичный | JSON `UserCreate`: `email`, `password`, `username` (обязателен, без него `422`) | `201`, `UserRead` |
| `POST /auth/login` | публичный | `application/x-www-form-urlencoded`: `username`, `password` | `200`, `Token` |
| `POST /auth/logout` | Bearer | нет | `204` |
| `GET /auth/me` | Bearer | нет | `200`, `UserRead` |
| `PATCH /auth/me` | Bearer | JSON `UserUpdate`: `email`, `password` и/или `username` | `200`, `UserRead` |
| `POST /auth/forgot-password` | публичный | JSON `email` | `202` |
| `POST /auth/reset-password` | публичный | JSON `token`, `password` | `200` |
| `POST /auth/request-verify-token` | публичный | JSON `email` | `202` |
| `POST /auth/verify` | публичный | JSON `token` | `200`, `UserRead` |

Лимиты: маршруты входа, регистрации, сброса пароля и подтверждения e-mail —
**10 запросов в минуту**, `/auth/me` — **100 запросов в минуту**.

Дополнительно FastAPI Users публикует `GET`, `PATCH` и `DELETE /auth/{id}` для
суперпользователя.

Параметр `username` в форме login — это e-mail, как предусмотрено
`OAuth2PasswordRequestForm`.

### Письма

После регистрации, по `request-verify-token` и при смене e-mail приложение
отправляет письмо с токеном подтверждения, а по `forgot-password` — письмо
сброса пароля. Ссылки в письмах ведут на страницы фронта, а не на API
(эндпоинты принимают только `POST`):

- подтверждение: `{PUBLIC_URL}/auth/verify?token=<token>`;
- сброс пароля: `{PUBLIC_URL}/auth/reset-password?token=<token>`.

Страница фронта сама отправляет токен `POST`-ом на `/auth/verify` или
`/auth/reset-password`. При смене e-mail через `PATCH /auth/me` признак
`is_verified` сбрасывается и отправляется новое письмо подтверждения.

## Энергетические напитки (`/energy-drinks`)

### Публичные маршруты

| Метод и путь | Параметры | Лимит | Ответ |
| --- | --- | --- | --- |
| `GET /energy-drinks/` | нет | 1000/мин | `200`, `list[EnergyDrinkWithMetricsReadSchema]` — все напитки |
| `GET /energy-drinks/{energy_drink_id}` | `energy_drink_id` (int) | 1000/мин | `200`, `EnergyDrinkWithMetricsReadSchema`; `404`, если не найден |
| `GET /energy-drinks/{energy_drink_id}/image` | `energy_drink_id` (int) | 1000/мин | `200`, изображение (`image/webp`); `404 ENERGY_DRINK_NOT_FOUND`, если напитка нет; `404 IMAGE_NOT_FOUND`, если у напитка нет картинки |

Элемент `EnergyDrinkWithMetricsReadSchema` содержит поля напитка и готовую
сводку по отзывам; самих отзывов в нём **нет**:

```json
{
  "id": 1,
  "name": "Название",
  "price": 1.99,
  "no_sugar": false,
  "created_at": "2026-01-15T12:30:00.123456Z",
  "avg_rating": 4.0,
  "reviews_count": 3,
  "avg_acidity": 3.7,
  "avg_sweetness": 4.0,
  "avg_concentration": 3.3,
  "avg_carbonation": 4.3,
  "avg_aftertaste": 3.0,
  "avg_price_quality": 4.0
}
```

Средние округляются до одного знака. Пока отзывов нет, `reviews_count` равен
`0`, а все `avg_*` — `null`. Отзывы напитка читаются отдельно:
`GET /reviews/?energy_drink_id=…`.

Заголовков кеша (`Cache-Control`, `ETag`) image-маршрут не ставит.

### Маршруты администратора

Для всех маршрутов этого раздела требуется Bearer-токен пользователя с
`is_superuser=true`.

| Метод и путь | Тело запроса | Ответ |
| --- | --- | --- |
| `POST /energy-drinks/` | JSON `EnergyDrinkCreateSchema` | `201`, `EnergyDrinkReadSchema` |
| `PUT /energy-drinks/{energy_drink_id}` | JSON `EnergyDrinkUpdateSchema` | `200`, `EnergyDrinkReadSchema` |
| `DELETE /energy-drinks/{energy_drink_id}` | нет | `204` |
| `POST /energy-drinks/{energy_drink_id}/image` | `multipart/form-data`, поле `image` (файл) | `201`, `EnergyDrinkReadSchema` |
| `DELETE /energy-drinks/{energy_drink_id}/image` | нет | `204` |

Размер загружаемой картинки ограничен `MAX_ENERGY_DRINK_IMAGE_SIZE` (в `.env`,
сейчас 1 МБ): большие запросы получают `413`. Сохраняется картинка в WebP
(качество 75), размер в пикселях не меняется. Фронт уменьшает фото больше лимита
ещё в браузере, до отправки.

Схемы напитка:

- `EnergyDrinkCreateSchema`: `name` (string), `price` (number или `null`),
  `no_sugar` (boolean, по умолчанию `false`);
- `EnergyDrinkUpdateSchema`: те же поля, все необязательные;
- `EnergyDrinkReadSchema`: поля create-схемы, `id` (integer) и `created_at`
  (datetime, в JSON — ISO 8601 с часовым поясом, `Z`);
- `EnergyDrinkWithMetricsReadSchema`: `EnergyDrinkReadSchema` плюс `avg_rating`,
  `reviews_count`, `avg_acidity`, `avg_sweetness`, `avg_concentration`,
  `avg_carbonation`, `avg_aftertaste`, `avg_price_quality`.

## Отзывы (`/reviews`)

| Метод и путь | Доступ | Параметры/тело | Ответ |
| --- | --- | --- | --- |
| `GET /reviews/` | публичный | `energy_drink_id` (**обязателен**, без него `422`), `limit`, `offset`, `order_by`, `order_direction` | `200`, `list[ReviewReadSchema]` — отзывы одного напитка |
| `GET /reviews/me` | Bearer + подтверждённый пользователь | `limit`, `offset`, `order_by` | `200`, `list[ReviewForUserSchema]` — отзывы текущего пользователя |
| `POST /reviews/{energy_drink_id}` | Bearer + подтверждённый пользователь | JSON `ReviewCreateSchema` | `201`, `ReviewReadSchema` |
| `PUT /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | JSON `ReviewUpdateSchema` | `200`, `ReviewReadSchema` |
| `DELETE /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | нет | `204` |

Лимиты: `GET /reviews/` — 1000/мин, `GET /reviews/me` — 100/мин; создание,
изменение и удаление отзывов — **10 запросов в минуту**.

`ReviewCreateSchema` содержит обязательные **целые** оценки от `1` до `5`:
`rating` (общая оценка), `acidity`, `sweetness`, `concentration`,
`carbonation`, `aftertaste`, `price_quality`, и необязательное `comment`
(строка до 1000 символов). Поля `overall` больше нет.

`ReviewUpdateSchema` содержит те же поля, все необязательные (частичное
обновление). Идентификаторы автора и напитка нельзя изменить через этот
маршрут.

`ReviewReadSchema` — это `ReviewCreateSchema` плюс `id`, автор
`user: {id, username, role}`, `created_at` и `updated_at` (datetime, ISO 8601 с
часовым поясом, `Z`); `energy_drink_id` в ответе нет — напиток известен из
запроса. `ReviewForUserSchema` (`GET /reviews/me`) — то же, но вместо автора
напиток `energy_drink` (`EnergyDrinkReadSchema`). При создании
отзыв привязывается к напитку из `{energy_drink_id}` и текущему пользователю.
Если напиток или отзыв не найден, возвращается `404`; при попытке изменить
или удалить чужой отзыв — `403`.

Один пользователь может оставить на напиток только один отзыв: повторное
создание возвращает `409` с кодом `REVIEW_ALREADY_EXISTS`.

## Rate limiting

Ограничения применяются в памяти процесса и сбрасываются после перезапуска.
Ключ лимита — IP клиента из первого значения `X-Forwarded-For` (иначе адрес
соединения). Запросы фронта идут с сервера Next, поэтому для них ключом служит
адрес контейнера фронта и лимиты общие для всех пользователей сайта.

| Маршруты | Лимит |
| --- | --- |
| `/auth/*` (вход, регистрация, сброс пароля, подтверждение e-mail) | 10/мин |
| `/auth/me` | 100/мин |
| `GET /energy-drinks/`, `GET /energy-drinks/{id}`, `GET /energy-drinks/{id}/image` | 1000/мин |
| `GET /reviews/` | 1000/мин |
| `GET /reviews/me` | 100/мин |
| `POST`/`PUT`/`DELETE /reviews/*` | 10/мин |

При превышении лимита возвращается `429 Too Many Requests`.

## Схемы пользователей

`UserRead` основана на `fastapi-users.schemas.BaseUser`:

```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "is_verified": true,
  "username": "NeonFox"
}
```

`UserCreate` принимает `email`, `password` и обязательное `username`.
Минимальная длина пароля — 8 символов, пароль не должен содержать e-mail
пользователя. `UserUpdate` принимает необязательные `email`, `password` и
`username`.

`Token` имеет поля `access_token` и `token_type` (обычно `bearer`).

## Известные расхождения

Найдено при проверке `mvp` в docker; пока не исправлено:

- нет `has_image`/`image_url` у напитка; `GET /reviews/` без `energy_drink_id`
  отвечает `422`, поэтому общей ленты отзывов нет — подробности в
  `docs/mvp-backend-questions.md`.
