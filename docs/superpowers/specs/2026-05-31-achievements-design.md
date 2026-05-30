# Настоящие ачивки (гибридная модель) — дизайн

Дата: 2026-05-31 · Ветка: `feat/achievements`

## Цель

Сделать существующие 8 ачивок настоящими: персист в БД, время анлока, тост «получено» в момент действия, метка «новое» в профиле. Набор ачивок не расширяем — берём текущие 8 из [achievements.ts](../../../frontend/src/entities/achievement/model/achievements.ts).

Сейчас ачивки полностью клиентские: `evaluateAchievements()` пересчитывает их из счётчиков при каждом рендере профиля. Нет персиста, времени анлока и уведомления.

## Принцип (гибрид)

Единственное место с логикой — `AchievementService.evaluate(user_id)`. Вызывается двумя путями:

- **Жадно (instant-тост)** — из write-эндпоинтов, где актор == получатель: create-review, add-favorite, create-submission. Ответ несёт `newly_unlocked` → фронт тостит сразу.
- **Лениво (канон + self-heal)** — из `GET /api/achievements/`: пересчёт + добор пропущенных анлоков. Сюда попадают случаи, где актор ≠ получатель (`approved-submit`/`three-approved` — заявку одобряет админ, ачивка у автора; автор увидит при следующем заходе на профиль).

Очередь/воркер не нужны на этом масштабе — оверинжиниринг. Синхронный вызов общего сервиса в рамках запроса.

## Набор ачивок (без изменений)

| id | метрика | порог |
|---|---|---|
| `first-review` | reviewsCount | 1 |
| `five-reviews` | reviewsCount | 5 |
| `twenty-reviews` | reviewsCount | 20 |
| `first-fav` | favoritesCount | 1 |
| `ten-favs` | favoritesCount | 10 |
| `first-submit` | submissionsCount | 1 |
| `approved-submit` | approvedSubmissionsCount | 1 |
| `three-approved` | approvedSubmissionsCount | 3 |

Дисплей (name/desc/icon/hue) остаётся на фронте. Правила (id/метрика/порог) дублируются в бэк-константах — это единственное допустимое дублирование, т.к. сервер должен уметь оценивать пороги.

## Источники счётчиков (бэк)

- `reviewsCount` — `count(EnergyDrinkReview WHERE user_id = :uid)` ([reviews.py](../../../backend/src/models/reviews.py), таблица `energy_drinks_reviews`).
- `favoritesCount` — `len(User.favorite_energy_drinks)` (m2m `user_favorite_drinks`).
- `submissionsCount` — `count(EnergyDrinkAddRequest WHERE user_id = :uid)`.
- `approvedSubmissionsCount` — `count(EnergyDrinkAddRequest WHERE user_id = :uid AND status = 'approved')`.

## БД

Новая таблица `user_achievements`:

| колонка | тип | прим. |
|---|---|---|
| id | int PK | autoincrement (из Base) |
| user_id | int FK → users.id | ondelete CASCADE |
| achievement_id | str | id из набора выше |
| unlocked_at | datetime | момент анлока |
| created_at / updated_at | datetime | из Base |

Unique constraint `(user_id, achievement_id)` — гарантирует идемпотентность (повторный evaluate не плодит строки).

Alembic-миграция на создание таблицы.

## Бэкенд

### Сервис
`backend/src/services/achievements.py` (новый модуль):

```python
ACHIEVEMENT_RULES: list[AchievementRule]  # id, metric, target — зеркало фронта

async def compute_stats(user_id, session) -> AchievementStats   # 4 счётчика
async def evaluate(user_id, session) -> list[str]               # инсертит новые анлоки, возвращает newly_unlocked ids
async def list_for_user(user_id, session) -> list[UserAchievementState]  # {id, unlocked_at} по уже открытым
```

`evaluate`:
1. `compute_stats`.
2. Прочитать уже открытые `achievement_id` юзера.
3. Для каждого правила: если `stat[metric] >= target` и id ещё не открыт → INSERT (`unlocked_at=utcnow()`), собрать в `newly`.
4. Commit, вернуть `newly`.

Идемпотентность — на unique-constraint (на гонке ловим IntegrityError и игнорим).

### API
Новый роутер, prefix `/achievements` (по образцу [base.py](../../../backend/src/api/base.py)):

- `GET /api/achievements/` (auth) → `evaluate()` затем отдать:
  ```json
  { "unlocked": [{ "id": "first-review", "unlocked_at": "..." }], "newly_unlocked": ["five-reviews"] }
  ```

### Жадные вызовы (instant-тост)
В 3 эндпоинта добавить вызов `evaluate(current_user.id, session)` после успешной мутации и вернуть `newly_unlocked` в ответе:

- `POST /api/reviews/` ([reviews.py](../../../backend/src/api/reviews.py))
- `PUT /api/auth/me/favorites/{id}/` (add-favorite)
- `POST /api/add-requests/` ([energy_drink_add_request.py](../../../backend/src/api/energy_drink_add_request.py))

`newly_unlocked: list[str]` добавляется опциональным полем в их response-схемы (не ломает существующих потребителей).

`approved-submit` / `three-approved` намеренно НЕ жадные (актор = админ, получатель = автор) — ловятся лениво на `GET /achievements/` при следующем заходе автора.

## Фронт

- `entities/achievement/api/achievementApi.ts` + server action `fetchAchievementsAction()` → `GET /api/achievements/`.
- Состояние анлока (`unlocked`, `unlocked_at`) — с бэка. **Прогресс-бары для закрытых** считаем клиентом из счётчиков (как сейчас) — бэк прогресс не отдаёт.
- `entities/achievement` — слить бэк-состояние со статическими defs: `unlocked`/`unlocked_at` от сервера, `progress` от клиента.
- ProfilePage: заменить чисто-клиентский `evaluateAchievements` на merge (defs + серверное состояние + клиентский прогресс).
- Тост «🏆 Достижение: {name}»: обработчики create-review / favorite-toggle / submission-create читают `newly_unlocked` из ответа экшена, мапят id→name (фронт-defs), тостят.
- Метка «новое» в профиле — если `unlocked_at` свежее 48 часов.

## Тесты

- Бэк (pytest): `evaluate` — пороги (ниже/равно/выше), идемпотентность (повторный вызов не плодит строк и не возвращает уже открытые в newly), добор пропущенных через `GET`.
- Фронт (Playwright smoke): профиль рендерит вкладку «Достижения» с состоянием от бэка без runtime-ошибок.

## Не входит (YAGNI)

- Расширение набора ачивок, тиры редкости.
- XP/уровни, публичный лидерборд.
- Реалтайм-нотификация автору при одобрении заявки (WebSocket) — ловим лениво.
- Хранение defs (name/desc/icon) в БД.

## Файлы (ориентир)

**Бэк:** `models/user_achievement.py`, `services/achievements.py`, `schemas/achievement.py`, `api/achievements.py`, правки `api/base.py` + 3 write-эндпоинта, alembic-миграция.
**Фронт:** `entities/achievement/api/achievementApi.ts`, правки `entities/achievement/{index,model}`, `ProfilePage.tsx`, обработчики submit-review / favorites / submissions, тост-хелпер.
