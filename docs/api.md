# API Energos

Документ описывает API, реализованный в `backend/api`. API построено на
FastAPI, использует JWT Bearer-аутентификацию и версионируется через префикс
`/v1`. Актуально для ветки `mvp` на коммите `77c2fe1`.

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
  `is_verified=true`, иначе `403` с `detail: "User is not verified"`;
- **администратор** — активный пользователь с `is_superuser=true`, иначе `403`
  с `detail: "Admin privileges required"`. Поля `role` у пользователя больше
  нет. Администратор не освобождается от проверки подтверждения e-mail.

### Пагинация и сортировка

Списковые маршруты принимают `limit` (по умолчанию `20`), `offset` (по
умолчанию `0`) и `order_by` (по умолчанию `id`). Верхней границы `limit` нет.

`order_by` — имя поля модели (для напитков, например, `id`, `name`, `price`,
`no_sugar`); сортировка только по возрастанию. Значение не проверяется: имя
несуществующего поля приведёт к `500`.

### Ошибки

Ошибки возвращаются в формате:

```json
{"detail": "..."}
```

Значение `detail` бывает трёх видов:

- строка — текст или код: `"Energy drink with id 999 not found"`,
  `"User is not verified"`, `"RESET_PASSWORD_BAD_TOKEN"`,
  `"REGISTER_USER_ALREADY_EXISTS"`, `"LOGIN_BAD_CREDENTIALS"`;
- объект `{"code": "...", "reason": "..."}` — ошибка пароля при регистрации и
  сбросе (`reason`: `Password should be at least 8 characters`,
  `Password should not contain e-mail`);
- список ошибок Pydantic — при ошибках валидации (`422`).

Основные статусы:

- `400` — некорректный JSON, битый токен подтверждения/сброса, неверный пароль;
- `401` — отсутствует/неверен токен либо неверные учётные данные;
- `403` — недостаточно прав, пользователь не подтверждён, чужой отзыв;
- `404` — объект не найден;
- `413` — тело запроса больше `MAX_ENERGY_DRINK_IMAGE_SIZE` (ответ — обычный
  текст `Content Too Large`, не JSON; ограничение действует на все запросы);
- `422` — ошибка валидации параметров или тела запроса;
- `429` — превышен rate limit.

## Аутентификация (`/auth`)

| Метод и путь | Доступ | Тело запроса | Ответ |
| --- | --- | --- | --- |
| `POST /auth/register` | публичный | JSON `UserCreate`: `email`, `password` | `201`, `UserRead` |
| `POST /auth/login` | публичный | `application/x-www-form-urlencoded`: `username`, `password` | `200`, `Token` |
| `POST /auth/logout` | Bearer | нет | `204` |
| `GET /auth/me` | Bearer | нет | `200`, `UserRead` |
| `PATCH /auth/me` | Bearer | JSON `UserUpdate`: `email` и/или `password` | `200`, `UserRead` |
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
| `GET /energy-drinks/` | `limit`, `offset`, `order_by` | 100/мин | `200`, `list[EnergyDrinkWithReviewsSchema]` |
| `GET /energy-drinks/count` | нет | 1000/мин | `200`, `{"count": <int>}` |
| `GET /energy-drinks/{energy_drink_id}` | `energy_drink_id` (int) | 1000/мин | `200`, `EnergyDrinkSchema`; `404`, если не найден |
| `GET /energy-drinks/{energy_drink_id}/image` | `energy_drink_id` (int) | 100/мин | `200`, бинарное тело изображения с сохранённым `Content-Type` |

Элемент `EnergyDrinkWithReviewsSchema` содержит:

```json
{
  "id": 1,
  "name": "Название",
  "price": 1.99,
  "no_sugar": false,
  "reviews": [
    {
      "acidity": 3,
      "sweetness": 4,
      "concentration": 3,
      "carbonation": 4,
      "aftertaste": 3,
      "price_quality": 4,
      "overall": 4
    }
  ]
}
```

Отзывы внутри напитка не содержат `id` и данных об авторе.

Если напиток не существует, image-маршрут возвращает `404`. Заголовков кеша
(`Cache-Control`, `ETag`) маршрут не ставит.

### Маршруты администратора

Для всех маршрутов этого раздела требуется Bearer-токен пользователя с
`is_superuser=true`.

| Метод и путь | Тело запроса | Ответ |
| --- | --- | --- |
| `POST /energy-drinks/` | JSON `EnergyDrinkCreateSchema` | `201`, `EnergyDrinkSchema` |
| `PUT /energy-drinks/{energy_drink_id}` | JSON `EnergyDrinkUpdateSchema` | `200`, `EnergyDrinkSchema` |
| `DELETE /energy-drinks/{energy_drink_id}` | нет | `204` |
| `POST /energy-drinks/{energy_drink_id}/image` | `multipart/form-data`, поле `image` (файл) | `201`, `EnergyDrinkSchema` |
| `DELETE /energy-drinks/{energy_drink_id}/image` | нет | `204` |

Размер загружаемой картинки ограничен `MAX_ENERGY_DRINK_IMAGE_SIZE` (в `.env`,
сейчас 1 МБ): большие запросы получают `413`.

Схемы напитка:

- `EnergyDrinkCreateSchema`: `name` (string), `price` (number или `null`),
  `no_sugar` (boolean, по умолчанию `false`);
- `EnergyDrinkUpdateSchema`: те же поля, все необязательные;
- `EnergyDrinkSchema`: поля create-схемы и `id` (integer).

## Отзывы (`/reviews`)

| Метод и путь | Доступ | Параметры/тело | Ответ |
| --- | --- | --- | --- |
| `GET /reviews/` | публичный | `limit`, `offset`, `order_by` | `200`, `list[ReviewSchema]` |
| `GET /reviews/me` | Bearer + подтверждённый пользователь | `limit`, `offset`, `order_by` | `200`, `list[ReviewSchema]` — отзывы текущего пользователя |
| `POST /reviews/{energy_drink_id}` | Bearer + подтверждённый пользователь | JSON `ReviewCreateSchema` | `201`, `ReviewSchema` |
| `PUT /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | JSON `ReviewUpdateSchema` | `200`, `ReviewSchema` |
| `DELETE /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | нет | `204` |

Лимиты: `GET /reviews/me` — 100/мин; создание, изменение и удаление отзывов —
**10 запросов в минуту**; `GET /reviews/` без лимита.

`ReviewCreateSchema` содержит обязательные оценки от `0` до `5`:
`acidity`, `sweetness`, `concentration`, `carbonation`, `aftertaste`,
`price_quality`, `overall`. Поля `comment` в схеме создания нет.

`ReviewUpdateSchema` содержит `comment` (строка до 1000 символов,
необязателен) и те же оценки от `0` до `5`; оценки передаются в теле
обязательно (допускают `null`). Идентификаторы автора и напитка нельзя
изменить через этот маршрут.

`ReviewSchema` — это `ReviewCreateSchema` плюс `id`; `energy_drink_id`,
`user_id` и `comment` в ответ не входят. При создании отзыв привязывается к
напитку из `{energy_drink_id}` и текущему пользователю. Если напиток или отзыв
не найден, возвращается `404`; при попытке изменить или удалить чужой отзыв —
`403`.

## Rate limiting

Ограничения применяются в памяти процесса и сбрасываются после перезапуска.
Ключ лимита — IP клиента из первого значения `X-Forwarded-For` (иначе адрес
соединения). Запросы фронта идут с сервера Next, поэтому для них ключом служит
адрес контейнера фронта и лимиты общие для всех пользователей сайта.

| Маршруты | Лимит |
| --- | --- |
| `/auth/*` (вход, регистрация, сброс пароля, подтверждение e-mail) | 10/мин |
| `/auth/me` | 100/мин |
| `GET /energy-drinks/`, `GET /energy-drinks/{id}/image` | 100/мин |
| `GET /energy-drinks/{id}`, `GET /energy-drinks/count` | 1000/мин |
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
  "is_verified": true
}
```

`UserCreate` принимает `email` и `password`. Минимальная длина пароля — 8
символов, пароль не должен содержать e-mail пользователя.
`UserUpdate` принимает необязательные `email` и `password`.

`Token` имеет поля `access_token` и `token_type` (обычно `bearer`).

## Известные расхождения

Найдено при проверке `mvp` в docker; пока не исправлено:

- `GET /energy-drinks/{id}/image` для напитка без картинки отвечает `200` с
  пустым телом, а не `404`;
- `GET /energy-drinks/count` в коде объявлен после `GET /energy-drinks/{id}`:
  при таком порядке путь `/count` может перехватываться маршрутом `/{id}` и
  отвечать `422`. Нужна проверка;
- нет `has_image`/`image_url`, `created_at`, автора и `comment` в выдаче
  отзывов — подробности и вопросы в `docs/mvp-backend-questions.md`.
