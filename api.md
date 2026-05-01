# API Документация проекта Energos

## Обзор

Проект Energos предоставляет API для управления энергетиками, отзывами и аутентификацией пользователей. API построено на FastAPI и использует JWT для аутентификации.

## Эндпоинты аутентификации (`/auth/`)

- **POST /auth/register/**  
  Регистрация нового пользователя.  
  Вход: `UserCreate` (username: str [3–50, `[a-zA-Z0-9_-]`], password: str [≥8 символов, заглавная+строчная+цифра])  
  Выход: `UserResponse` (id: int, username: str, role: str)  
  **Rate limit: 5 запросов/минуту с одного IP. При превышении → HTTP 429.**

- **POST /auth/login/**  
  Вход в систему.  
  Вход: `OAuth2PasswordRequestForm` (username: str, password: str)  
  Выход: `Token` (access_token: str, token_type: str)  
  **Rate limit: 10 запросов/минуту с одного IP. При превышении → HTTP 429.**

- **GET /auth/me/**  
  Получение информации о текущем пользователе.  
  Вход: JWT токен в заголовке Authorization  
  Выход: `UserResponse`

## Эндпоинты энергетиков (`/energy-drinks/`)

- **POST /energy-drinks/{id}/upload-image/**  
  Загрузка изображения для энергетика.  
  Вход: UploadFile (файл изображения), JWT токен  
  Выход: `EnergyDrinkSchema`

- **POST /energy-drinks/**  
  Создание нового энергетика.  
  Вход: `EnergyDrinkSchema`, JWT токен  
  Выход: `EnergyDrinkSchema`

- **GET /energy-drinks/{id}/**  
  Получение энергетика по ID.  
  Вход: id (int >= 1)  
  Выход: `EnergyDrinkSchema`

- **GET /energy-drinks/**  
  Получение всех энергетиков.  
  Query params: `limit` (int, 1–200, опционально), `offset` (int, по умолчанию 0)  
  Выход: List[`EnergyDrinkSchema`]

- **PUT /energy-drinks/{id}/**  
  Обновление энергетика.  
  Вход: `EnergyDrinkSchema`, id (int >= 1), JWT токен  
  Выход: `EnergyDrinkSchema`

- **DELETE /energy-drinks/{id}/**  
  Удаление энергетика.  
  Вход: id (int >= 1), JWT токен  
  Выход: `EnergyDrinkSchema`

## Эндпоинты отзывов (`/reviews/`)

- **POST /reviews/**  
  Создание нового отзыва.  
  Вход: `EnergyDrinkReviewSchema`, JWT токен  
  Выход: `EnergyDrinkReviewSchema`  
  **Rate limit: 10 запросов/минуту с одного IP. При превышении → HTTP 429.**

- **GET /reviews/{id}/**  
  Получение отзыва по ID.  
  Вход: id (int >= 1)  
  Выход: `EnergyDrinkReviewSchema`

- **GET /reviews/**  
  Получение всех отзывов.  
  Вход: нет  
  Выход: List[`EnergyDrinkReviewSchema`]

- **GET /reviews/energy-drink/{energy_drink_id}/**  
  Получение отзывов по ID энергетика.  
  Вход: energy_drink_id (int >= 1)  
  Выход: List[`EnergyDrinkReviewSchema`]

- **GET /reviews/user/**  
  Получение отзывов текущего пользователя.  
  Вход: JWT токен  
  Выход: List[`EnergyDrinkReviewSchema`]

- **PUT /reviews/{id}/**  
  Обновление отзыва.  
  Вход: `EnergyDrinkReviewSchema`, id (int >= 1), JWT токен  
  Выход: `EnergyDrinkReviewSchema`

- **DELETE /reviews/{id}/**  
  Удаление отзыва.  
  Вход: id (int >= 1), JWT токен  
  Выход: `EnergyDrinkReviewSchema`

## Модели данных

- `UserCreate`: username (str), password (str)
- `UserResponse`: id (int), username (str), role (str)
- `Token`: access_token (str), token_type (str)
- `EnergyDrinkSchema`: (поля энергетика, включая name, description, etc.)
- `EnergyDrinkReviewSchema`: (поля отзыва, включая rating, comment, etc.)

Для детального описания моделей обратитесь к файлам в `backend/src/schemas/`.

## Rate Limiting

Реализован через `slowapi` (in-memory, сбрасывается при перезапуске сервера).  
Ключ — IP-адрес клиента (`X-Forwarded-For` или `REMOTE_ADDR`).  
При превышении лимита сервер возвращает **HTTP 429 Too Many Requests**.  
Фронтенд отображает сообщение: «Слишком много запросов. Пожалуйста, подождите немного.»
