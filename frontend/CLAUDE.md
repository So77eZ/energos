# Frontend — заметки для агентов

Стек: Next.js 15 (App Router) + React 19 + TypeScript, Tailwind 3, FSD. Тесты: vitest (unit) + Playwright (e2e). Прод-сборка — docker (запечённый образ).

## Архитектура

Feature-Sliced Design, слои `app → widgets → features → entities → shared` — импорт только вниз, без кросс-слайс (кроме `@x`). Направление проверяется тестом `src/fsd-boundaries.test.ts` (vitest) — не сгниёт молча.

## Gotchas

- Тема и шрифт — РАЗНЫЕ localStorage-ключи: тема в `energos_theme`,
  шрифт/prefs в `energos_prefs`. Запись темы не в тот ключ →
  light-only баг (всё рендерится дарк, хотя toggle стоит на light).
- Light-тему аудитить ОТДЕЛЬНЫМ контраст-проходом: дарк-аудит его не
  покрывает. Зоны риска — `--txt-quiet` (футер/оси/плейсхолдеры) и
  text-on-accent (`--on-accent` должен быть тёмным в light, иначе
  белый текст на светло-cyan ≈1.4:1).
- Docker-фронт — запечённый образ без volume: правки не видны без ребилда.
  Пересобирать только frontend: `docker compose up -d --no-deps --build frontend`
  (полный `--build` = orphan-конфликт бэка + registry-TLS-флак; ретрай/`DOCKER_BUILDKIT=0`).
- e2e/скриншоты гонять против `http://localhost` (docker-Caddy), не dev `:3000`
  (там /api-proxy trailing-slash + cold-compile флак). Для light-прохода инжектить
  `localStorage energos_theme={"theme":"light"}`; age-gate глушить `energos_age_verified=true`.
