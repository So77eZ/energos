// Server-safe реестр шрифтов (без 'use client' / DOM) — импортится и клиентом
// (user-preferences.ts), и сервером (layout.tsx для preload по cookie).

export const FONTS = [
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Share Tech Mono', label: 'Share Tech Mono' },
  { id: 'Orbitron', label: 'Orbitron' },
  { id: 'Rajdhani', label: 'Rajdhani' },
  { id: 'Monocraft', label: 'Monocraft' },
] as const

export type FontId = (typeof FONTS)[number]['id']

export const DEFAULT_FONT: FontId = 'JetBrains Mono'

// Google Fonts CSS-href для ОПЦИОНАЛЬНЫХ шрифтов (не входят в always-load набор
// layout.tsx). JetBrains Mono всегда загружен, Monocraft self-hosted — их тут нет.
export const OPTIONAL_FONT_HREFS: Partial<Record<FontId, string>> = {
  'Share Tech Mono': 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
  'Orbitron':        'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap',
  'Rajdhani':        'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap',
}

// Cookie с выбранным шрифтом — чтобы сервер мог отдать <link> нужного шрифта
// на первом рендере (без FOUT). Дублирует localStorage-преференс (см.
// user-preferences.ts), пишется при setFont.
export const FONT_COOKIE = 'energos_font'

/** Стабильный id для <link> опционального шрифта — общий для server-preload и
 *  клиентского ensureFontLoaded, чтобы не грузить шрифт дважды. */
export function fontLinkId(font: string): string {
  return `font-dyn-${font.replace(/\s+/g, '-').toLowerCase()}`
}

/** Валидирует произвольную строку (из cookie/storage) как FontId. */
export function isFontId(v: unknown): v is FontId {
  return typeof v === 'string' && FONTS.some((f) => f.id === v)
}
