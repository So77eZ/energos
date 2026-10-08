# API Energos

Документ описывает API, реализованный в `backend/api`. API построено на
FastAPI, использует JWT Bearer-аутентификацию и версионируется через префикс
`/v1`.

## Базовые URL

- При прямом обращении к приложению: `http://<host>/v1`
- Через reverse proxy проекта: `https://<host>/api/v1`
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/openapi.json`

В таблицах ниже используется внешний URL с префиксом `/api/v1`. При прямом
обращении к приложению префикс `/api` нужно убрать. Маршруты с завершающим `/`
поддерживаются FastAPI; при его отсутствии FastAPI может вернуть redirect.

## Общие правила

### Аутентификация

Для защищённых маршрутов передавайте токен из `POST /auth/login`:

```http
Authorization: Bearer <access_token>
```

Регистрация, вход, сброс пароля и подтверждение e-mail используют стандартные
маршруты и схемы FastAPI Users.

### Ошибки

Ошибки возвращаются в формате:

```json
{"detail": "..."}
```

Для ошибок валидации `detail` содержит список ошибок Pydantic. Основные статусы:

- `400` — некорректный JSON или бизнес-ошибка;
- `401` — отсутствует/неверен токен либо неверные учётные данные;
- `403` — недостаточно прав или пользователь не подтверждён;
- `404` — объект не найден;
- `422` — ошибка валидации параметров или тела запроса;
- `429` — превышен rate limit.

## Аутентификация (`/auth`)

Ко всем auth-маршрутам применяется лимит **10 запросов в минуту**.

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

После регистрации приложение отправляет письмо с токеном подтверждения.
Параметр `username` в форме login — это e-mail, как предусмотрено
`OAuth2PasswordRequestForm`.

## Энергетические напитки (`/energy-drinks`)

### Публичные маршруты

| Метод и путь | Параметры | Ответ |
| --- | --- | --- |
| `GET /energy-drinks/` | `limit` (int, по умолчанию `20`), `offset` (int, по умолчанию `0`), `order_by` (по умолчанию `id`) | `200`, `list[EnergyDrinkWithReviewsSchema]` |
| `GET /energy-drinks/{energy_drink_id}/image` | `energy_drink_id` (int) | `200`, бинарное тело изображения с сохранённым `Content-Type` |

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

Если напиток не существует или у него нет изображения, image-маршрут
возвращает `404`.

### Маршруты администратора

Для всех маршрутов этого раздела требуется Bearer-токен пользователя с
`role=admin`.

| Метод и путь | Тело запроса | Ответ |
| --- | --- | --- |
| `POST /energy-drinks/` | JSON `EnergyDrinkCreateSchema` | `201`, `EnergyDrinkSchema` |
| `PUT /energy-drinks/{energy_drink_id}` | JSON `EnergyDrinkUpdateSchema` | `200`, `EnergyDrinkSchema` |
| `DELETE /energy-drinks/{energy_drink_id}` | нет | `204` |
| `POST /energy-drinks/{energy_drink_id}/image` | `multipart/form-data`, поле `image` (файл) | `201`, `EnergyDrinkSchema` |
| `DELETE /energy-drinks/{energy_drink_id}/image` | нет | `204` |

Схемы напитка:

- `EnergyDrinkCreateSchema`: `name` (string), `price` (number или `null`),
  `no_sugar` (boolean, по умолчанию `false`);
- `EnergyDrinkUpdateSchema`: те же поля, все необязательные;
- `EnergyDrinkSchema`: поля create-схемы и `id` (integer).

## Отзывы (`/reviews`)

| Метод и путь | Доступ | Параметры/тело | Ответ |
| --- | --- | --- | --- |
| `GET /reviews/` | публичный | `limit` (int, `20`), `offset` (int, `0`), `order_by` (string, `id`) | `200`, `list[ReviewSchema]` |
| `POST /reviews/{energy_drink_id}` | Bearer + подтверждённый пользователь | JSON `ReviewCreateSchema` | `201`, `ReviewSchema` |
| `PUT /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | JSON `ReviewUpdateSchema` | `200`, `ReviewSchema` |
| `DELETE /reviews/{review_id}` | Bearer + подтверждённый пользователь, только автор отзыва | нет | `204` |

Для администратора проверка подтверждения пользователя не требуется.
Создание, изменение и удаление отзывов ограничены **10 запросами в минуту**.

`ReviewCreateSchema` содержит обязательные оценки от `0` до `5`:
`acidity`, `sweetness`, `concentration`, `carbonation`, `aftertaste`,
`price_quality`, `overall`.

`ReviewUpdateSchema` содержит необязательные поля `comment` (строка до 1000
символов) и те же оценки от `0` до `5`. Идентификаторы автора и напитка
нельзя изменить через этот маршрут.

`ReviewSchema` — это `ReviewCreateSchema` плюс `id`. При создании отзыв
привязывается к напитку из `{energy_drink_id}` и текущему пользователю.
Если напиток или отзыв не найден, возвращается `404`; при попытке изменить или
удалить чужой отзыв — `403`.

## Rate limiting

Ограничения применяются в памяти процесса и сбрасываются после перезапуска:

- auth: `10/minute` на все маршруты `/auth`;
- чтение списка напитков и изображений: `100/minute`;
- создание/изменение/удаление отзывов: `10/minute`.

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
символов; дополнительные проверки выполняются менеджером пользователей.
`UserUpdate` принимает необязательные `email` и `password`.

`Token` имеет поля `access_token` и `token_type` (обычно `bearer`).
