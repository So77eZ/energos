# Бесплатный стенд: Vercel + Render + Supabase

Стенд для разработки и небольшого круга тестировщиков, примерно до 15 человек. Для настоящего запуска не подходит: там нужен VPS в РФ с `docker-compose` (см. `docs/backend-go-migration.md`, раздел 8).

| Часть | Где | Тариф |
|---|---|---|
| Фронт (Next) | Vercel | Hobby |
| Бэк (FastAPI) | Render | Free |
| Postgres | Supabase | Free |

Код менять не нужно: бэк принимает запросы и с префиксом `/api`, и без него, так что Caddy на этом стенде не нужен.

## Ограничения

- **Render засыпает** после 15 минут без запросов. Первый запрос после сна обрабатывается около минуты, и первая загрузка сайта может упасть по таймауту. Помогает обновить страницу.
- **Supabase ставит проект на паузу**, если к базе неделю никто не обращался. Снимается кнопкой в панели Supabase.
- **Загрузка картинок не работает**: хранилища нет, запрос на загрузку падает с 500.
- **Из РФ сайт может быть доступен нестабильно**, особенно с мобильного интернета: все три сервиса зарубежные.
- **Реальные данные сюда не класть.** Известные дыры из `docs/issues-audit.md` (раздел 5) на этом стенде тоже есть.

## 1. Supabase — база

1. Создать проект, регион — Frankfurt (`eu-central-1`). Пароль БД сохранить.
2. **Connect** → вкладка **Session pooler** → скопировать строку подключения. Прямое подключение (Direct) на бесплатном тарифе работает только по IPv6, Render его не поддерживает. Transaction pooler (порт 6543) не подходит: ломает prepared statements у asyncpg.
3. Привести строку к виду, который ждёт бэк: `postgresql://` заменить на `postgresql+asyncpg://`, в конец дописать `?ssl=require`:

```
postgresql+asyncpg://postgres.<ref>:<пароль>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?ssl=require
```

Если в пароле есть спецсимволы (`@`, `:`, `/`, `#`), их нужно закодировать (URL-encode) или сменить пароль на буквы и цифры.

## 2. Render — бэк

Имя Vercel-проекта нужно знать заранее: адрес фронта будет `https://<имя>.vercel.app`, и он понадобится здесь.

1. **New → Web Service** → подключить GitHub-репозиторий `So77eZ/energos`.
2. **Root Directory:** `backend`, **Runtime:** Docker (возьмёт `backend/Dockerfile`), **Region:** Frankfurt, **Instance:** Free.
3. **Environment:**

| Переменная | Значение |
|---|---|
| `DATABASE_URL` | строка из шага 1.3 |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://<имя>.vercel.app` |
| `PUBLIC_URL` | `https://<имя>.vercel.app` |
| `DEPLOY_ENV` | `dev` — при `prod` бэк отвечает 403 на запросы без `Origin`/`Referer`, в том числе на открытие адреса бэка в браузере |
| `PORT` | `8000` — на этом порту слушает uvicorn из Dockerfile |
| `SUPABASE_URL` | `http://127.0.0.1:9` — заглушка, хранилища нет |
| `SUPABASE_ACCESS_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_BUCKET_NAME`, `SUPABASE_REGION` | любые непустые значения, например `none` |

4. Deploy. При старте контейнер сам прогоняет миграции и запускает uvicorn.
5. Проверка: `https://<сервис>.onrender.com/` отвечает `{"message":"Energy drink rating API"}`.

## 3. Vercel — фронт

1. **Add New → Project** → импортировать `So77eZ/energos`, **Root Directory:** `frontend`. Фреймворк Next.js определится сам.
2. **Environment Variables** задать **до первой сборки**: адрес бэка вшивается в сборку, и после изменения переменных нужен повторный деплой.

| Переменная | Значение |
|---|---|
| `API_ORIGIN` | `https://<сервис>.onrender.com` |
| `NEXT_PUBLIC_ORIGIN` | `https://<имя>.vercel.app` |

3. Deploy и открыть `https://<имя>.vercel.app`.

## 4. Первый админ

1. Зарегистрироваться на сайте.
2. Supabase → **SQL Editor**:

```sql
UPDATE users SET role = 'admin' WHERE username = '<логин>';
```

3. Выйти и зайти заново.

## Обновление

Render и Vercel сами пересобирают стенд при пуше в `main`.
