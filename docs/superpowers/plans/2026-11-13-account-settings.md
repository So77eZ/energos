# Account Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Добавить смену почты и пароля в профиль через уже существующий API.

**Architecture:** Новая вкладка профиля использует формы features/auth. Отдельные server actions повторно подтверждают текущий пароль через authApi.login и вызывают типизированный authApi.updateMe. Общие обработчики API, сессии и ошибок сохраняются.

**Tech Stack:** Next.js, React useActionState, TypeScript, Vitest, Playwright, существующий FastAPI API.

**Spec:** docs/superpowers/specs/2026-11-13-account-settings.md

## Global Constraints

- Текущие пароль и email владельца сессии подтверждаются сервером, поля формы не выбирают пользователя.
- Новый пароль: минимум 8 символов, без trim; повтор обязателен.
- Пароли не возвращаются в action state и не логируются.
- Backend, DB, зависимости и production не меняются.
- Сохранить CRLF/кодировку изменяемых файлов и все посторонние файлы пользователя.

## Review Focus

- Неверный текущий пароль не вызывает PATCH и не завершает действующую сессию.
- Ошибка занятой почты и HTTP 429 понятны пользователю; истёкшая сессия перенаправляет на вход.
- Повтор текущей почты не сбрасывает подтверждение из-за поведения существующего API.
- После изменения почты повторная отправка подтверждения относится к новому адресу.
- Пароли с пробелами и Unicode проверяются без изменения значения; форма помещается в 320 px.

## Tasks

1. Добавить тесты account-actions.test.ts и API-тесты; увидеть ошибки до реализации. Реализовать account-actions.ts и расширить updateMe в authApi.ts.
2. Добавить AccountSettings.tsx, вкладку account в ProfilePage.tsx, возврат после входа в profile/page.tsx и небольшой scoped CSS. Сбросить состояние VerifyEmailBanner при новой почте.
3. Проверить оба сценария на отдельном локальном аккаунте, письмо в Mailpit, сохранение состояния, ошибки и мобильную ширину. Дополнить account e2e.
4. Unit-suite, TypeScript, ревью, Docker frontend build, страница/API и итоговый браузерный прогон. Зафиксировать локально; push/merge/production отдельно не выполнять.
