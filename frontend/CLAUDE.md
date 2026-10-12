# Frontend — заметки для агентов

Стек: Next.js 15 (App Router) + React 19 + TypeScript, FSD, стили — свой CSS в `src/app/globals.css` (без Tailwind). Тесты: vitest (unit) + Playwright (e2e). Прод-сборка — docker (запечённый образ).

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
- Реальный IP клиента бэк берёт из `X-Forwarded-For` (rate limit по IP). Его ставит `rawRequest`
  (`shared/api/http.ts`) на всех серверных запросах, кроме идущих в Data Cache (`next.revalidate`):
  заголовки входят в ключ кеша. `next/headers` туда тянуть напрямую нельзя — `http.ts` попадает и в
  клиентский бандл (через client-компоненты с `drinkApi`/`reviewEmojiApi`), сборка падает.
  Поэтому импорт `#client-ip` подменяется через `imports` в `package.json`: условие `react-server`
  → `client-ip.ts` (реальный), иначе `client-ip.noop.ts`. Не заменять на обычный импорт.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
