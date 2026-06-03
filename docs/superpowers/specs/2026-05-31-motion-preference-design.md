# Дизайн: настройка движения (motion preference) + уведомление

**Дата:** 2026-05-31
**Ветка:** feat/achievements
**Статус:** утверждён, в реализации

## Проблема

Сайт уважает системную настройку `prefers-reduced-motion: reduce` (Windows: «Эффекты
анимации» выкл.): замораживается дрейф liquid-bg, 3D-банки рендерятся статичным кадром,
глушатся бесконечные keyframes. Это правильно для accessibility, НО:

1. Юзер с урезанными анимациями видит «мёртвый» сайт (статичные банки, неподвижный фон)
   и **не понимает почему** — нет никакого объяснения.
2. Нет способа **переопределить** поведение из самого сайта — юзер вынужден лезть в
   настройки ОС, даже если конкретно на этом сайте хочет анимации.

## Решение

Две связанные части:

1. **Пользовательский оверрайд движения** — настройка, позволяющая принудительно включить
   анимации вопреки системному `reduce`.
2. **Одноразовый баннер-уведомление** — объясняет урезание и направляет в настройку.

### 1. Настройка движения

Новое поле в `ThemePrefs` ([shared/lib/theme/types.ts](../../../frontend/src/shared/lib/theme/types.ts)):

```ts
motion: 'system' | 'always'   // дефолт 'system'
```

- `'system'` — уважать `prefers-reduced-motion` (текущее поведение).
- `'always'` — анимации всегда включены, игнорируя системную настройку.

Хранится в существующем `localStorage['energos_theme']` (вместе с темой/акцентом/эффектами),
дефолт в `DEFAULT_PREFS` ([constants.ts](../../../frontend/src/shared/lib/theme/constants.ts)).

**Применение** — `applyToDOM` в [theme-provider.tsx](../../../frontend/src/shared/lib/theme/theme-provider.tsx)
вешает атрибут на `<html>`:

```
motion === 'always'  →  <html data-force-motion>
motion === 'system'  →  атрибут снят
```

**Контрол** — сегментный переключатель в секции «Эффекты» [TweaksBody.tsx](../../../frontend/src/widgets/tweaks-panel/ui/TweaksBody.tsx)
(как переключатель Темы), появляется и в floating-панели, и во вкладке «Оформление» профиля:

```
Анимации:  [ По системе ]  [ Всегда вкл. ]
```

### 2. Связка оверрайда с эффектами

**CSS** ([globals.css](../../../frontend/src/app/globals.css)) — reduced-motion блок скоупится так,
чтобы НЕ применяться при оверрайде:

```css
@media (prefers-reduced-motion: reduce) {
  :root:not([data-force-motion]) .lb-blob,
  :root:not([data-force-motion]) .ticker-row,
  /* …остальные селекторы… */ { animation: none !important; }
}
```

**3D-банки** ([ThreeCans.tsx](../../../frontend/src/widgets/three-cans/ui/ThreeCans.tsx)) — берут
`motion` из `useTheme()`, эффективный флаг:

```
reduced = systemPrefersReduce && motion !== 'always'
```

При `'always'` сцена монтируется с `animate=true` (банки крутятся) даже если система просит reduce.
Переключение настройки → effect remount (deps включают reduced).

### 3. Баннер-уведомление (MotionNotice)

Новый клиентский компонент `MotionNotice.tsx`, монтируется в [AppShell](../../../frontend/src/shared/ui/app-shell/AppShell.tsx)
рядом с `AgeGate`.

**Условие показа (все три):**
- система просит `prefers-reduced-motion: reduce`;
- `motion === 'system'` (юзер не включил оверрайд);
- ранее не закрыт: `localStorage['energos_motion_notice']` не выставлен.

**Вид:** snackbar внизу экрана (своя вёрстка, не toast — toast авто-исчезает). Текст:

> Часть анимаций сайта урезана из-за системных настроек. Изменить поведение можно в **профиле**.

- «**профиле**» — ссылка на `/profile`.
- Единственная кнопка — **×** (закрыть). Закрытие ставит `localStorage['energos_motion_notice']='dismissed'`
  → баннер больше не появляется никогда.
- Сам баннер **без motion-анимации входа** (показывается именно reduce-motion юзеру): мгновенно
  или лёгкий opacity-fade, без slide/translate.

**Edge-cases:**
- Включил «Всегда вкл.» → условие `motion === 'system'` ложно → баннер скрыт (даже если не закрывал).
- Закрыл баннер → флаг навсегда, независимо от дальнейших переключений.
- Не reduce-motion юзер → баннер никогда не показывается, контрол «Анимации» доступен (на «По системе»
  работает как сейчас, «Всегда вкл.» — без видимой разницы т.к. анимации и так идут).

## Объём изменений

| Файл | Что |
|------|-----|
| `shared/lib/theme/types.ts` | `+ motion: 'system' \| 'always'` |
| `shared/lib/theme/constants.ts` | дефолт `motion: 'system'` |
| `shared/lib/theme/theme-provider.tsx` | `setMotion` + `data-force-motion` в applyToDOM |
| `widgets/tweaks-panel/ui/TweaksBody.tsx` | сегментный контрол «Анимации» |
| `app/globals.css` | скоуп reduced-блока `:root:not([data-force-motion])` + стили `.motion-notice` |
| `widgets/three-cans/ui/ThreeCans.tsx` | `reduced = systemReduce && motion !== 'always'` |
| `widgets/motion-notice/ui/MotionNotice.tsx` | **новый** компонент-баннер |
| `shared/ui/app-shell/AppShell.tsx` | монтаж `<MotionNotice />` |

Без бэкенда — чисто клиент.

## Не входит (YAGNI)

- Серверное хранение настройки (только localStorage, как у темы/шрифта).
- Тонкая настройка отдельных анимаций (фон/банки порознь) — уже есть тогглы «Эффекты»;
  motion-оверрайд глобальный.
- Повторный показ баннера после dismiss.
