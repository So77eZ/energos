# Contributing — Energos

Спасибо за вклад! Ниже — как устроена разработка.

## Запуск

Стек поднимается через Docker Compose (Caddy отдаёт фронт + проксирует `/api`):

```bash
docker compose up -d --build
```

Фронт — запечённый образ; после правок пересобирать только его:

```bash
docker compose up -d --no-deps --build frontend
```

## Локальные проверки (git-хук)

Опционально, ускоряет фидбэк до CI. Один раз на клон:

```bash
git config core.hooksPath .githooks
```

Тогда `git push` сначала прогонит `tsc --noEmit` + `vitest run` (frontend). Обойти разово — `git push --no-verify`.

## Архитектура (фронт)

**Feature-Sliced Design**: слои `app → widgets → features → entities → shared`, импорт **только вниз**, без кросс-слайс (кроме `@x`). Направление проверяет тест `frontend/src/fsd-boundaries.test.ts` (vitest) — он же гоняется в CI и хуке.

## Тесты

- **vitest** — только чистая логика (env `node`, без jsdom): `reel`, `achievements`, `activity-calendar`, `crop-output`, `fsd-boundaries` и т.п. DOM-тяжёлое (порталы/фокус/анимации) — НЕ юнитим, проверяем e2e/визуалом.
- **Playwright** — e2e (guest + authed), гонять против `http://localhost` (docker-Caddy), не dev `:3000`.

## Поток работы

1. Задача = **issue на доске** ([GitHub Project «Energos»](https://github.com/users/So77eZ/projects/1)). Берёшь — двигаешь в In Progress.
2. **Ветка = одна задача**: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `refactor/…` от `main`.
3. **PR в `main`** → проходит CI (`tsc` + `vitest` + `next build`) → мёрж. `main` защищён: прямой push закрыт, нужен PR + зелёный CI.
4. На финише: `Closes #N` в PR закрывает issue; статус на доске → Done.

## Коммиты

- На **русском**, Conventional-стиль: `feat(scope): …`, `fix(scope): …`, `refactor`, `chore`, `docs`.
- **Без** `Co-Authored-By`-трейлеров.
- Subject коротко; тело — только если «почему» не очевидно.

## Бэкенд-зависимости

Фронт ведётся отдельно от бэка ([контракт](../docs/backend-contract.md) в `docs/`). Бэк-зависимые места = «висячий коннектор» под контракт, помечаются `TODO(backend #N)`.
