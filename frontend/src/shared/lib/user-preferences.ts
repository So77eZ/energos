'use client'

import { useState, useEffect, useCallback } from 'react'

// Список доступных шрифтов.
//
// Загрузка:
//  - JetBrains Mono грузится всегда (дефолт --font-sans + --font-mono) через
//    <link> в layout.tsx, вместе с Russo One (--font-display) и Exo 2 (--font-title).
//  - Share Tech Mono / Orbitron / Rajdhani — опциональные: грузятся динамически
//    через ensureFontLoaded() только когда юзер реально их выбрал, чтобы не тянуть
//    три неиспользуемых семейства на каждый первый рендер (~экономия трафика).
//  - Monocraft self-hosted: /public/fonts/Monocraft.woff2, @font-face в globals.css.
//
// Добавляешь новый Google-шрифт — допиши href в FONT_HREFS (если опциональный)
// либо в <link> layout.tsx (если должен грузиться всегда), иначе упадёт в fallback.
export const FONTS = [
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Share Tech Mono', label: 'Share Tech Mono' },
  { id: 'Orbitron', label: 'Orbitron' },
  { id: 'Rajdhani', label: 'Rajdhani' },
  { id: 'Monocraft', label: 'Monocraft' },
] as const

// Google Fonts CSS-href для опциональных шрифтов (не входят в always-load набор
// layout.tsx). JetBrains Mono / Monocraft тут нет — первый всегда загружен,
// второй self-hosted.
const FONT_HREFS: Partial<Record<string, string>> = {
  'Share Tech Mono': 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
  'Orbitron':        'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap',
  'Rajdhani':        'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap',
}

// Один раз вставляет <link rel=stylesheet> для опционального шрифта. No-op если
// шрифт всегда-загружен/self-hosted или уже подгружен ранее.
function ensureFontLoaded(font: string): void {
  if (typeof document === 'undefined') return
  const href = FONT_HREFS[font]
  if (!href) return
  const id = `font-dyn-${font.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

export type FontId = (typeof FONTS)[number]['id']

const STORAGE_KEY = 'energos_prefs'
const SCHEMA_VERSION = 1
const DEFAULT_FONT: FontId = 'JetBrains Mono'

interface Prefs {
  v: number
  font: FontId
}

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { v: SCHEMA_VERSION, font: DEFAULT_FONT }
    const parsed = JSON.parse(raw) as Partial<Prefs>
    if (parsed.v !== SCHEMA_VERSION) return { v: SCHEMA_VERSION, font: DEFAULT_FONT }
    const validFontIds = FONTS.map(f => f.id) as readonly string[]
    if (!validFontIds.includes(parsed.font as string)) {
      return { v: SCHEMA_VERSION, font: DEFAULT_FONT }
    }
    return parsed as Prefs
  } catch {
    return { v: SCHEMA_VERSION, font: DEFAULT_FONT }
  }
}

function writePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // localStorage недоступен (private mode, iframe sandbox и т.д.)
  }
}

export function applyFont(font: FontId): void {
  if (typeof document === 'undefined') return
  ensureFontLoaded(font)
  document.documentElement.style.setProperty('--font-sans', `"${font}"`)
}

export function useUserPreferences() {
  const [font, setFontState] = useState<FontId>(DEFAULT_FONT)

  useEffect(() => {
    const prefs = readPrefs()
    setFontState(prefs.font)
    applyFont(prefs.font)
  }, [])

  const setFont = useCallback((newFont: FontId) => {
    setFontState(newFont)
    applyFont(newFont)
    writePrefs({ v: SCHEMA_VERSION, font: newFont })
  }, [])

  return { font, setFont }
}
