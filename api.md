# API Документация проекта Energos

## Обзор

Проект Energos предоставляет API для управления энергетиками, отзывами и аутентификацией пользователей. API построено на FastAPI и использует JWT для аутентификации.

## Эндпоинты аутентификации (`/auth/`)

- **POST /auth/register/**  
  Регистрация нового пользователя.  
  Вход: `UserCreate` (username: str, password: str)  
  Выход: `UserResponse` (id: int, username: str, role: str)

- **POST /auth/login/**  
  Вход в систему.  
  Вход: `OAuth2PasswordRequestForm` (username: str, password: str)  
  Выход: `Token` (access_token: str, token_type: str)

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
  Вход: нет  
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

Для детального описания моделей обратитесь к файлам в `backend/app/api/models/`.
