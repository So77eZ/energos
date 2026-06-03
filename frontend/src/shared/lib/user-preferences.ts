'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FONTS, DEFAULT_FONT, OPTIONAL_FONT_HREFS, FONT_COOKIE, fontLinkId, isFontId,
  type FontId,
} from './fonts'

// Список доступных шрифтов + загрузка.
//
//  - JetBrains Mono грузится всегда (дефолт --font-sans + --font-mono) через
//    <link> в layout.tsx, вместе с Russo One (--font-display) и Exo 2 (--font-title).
//  - Share Tech Mono / Orbitron / Rajdhani — опциональные: если юзер их выбрал,
//    сервер отдаёт <link> по cookie (layout.tsx, без FOUT), а клиент
//    подстраховывает через ensureFontLoaded() (дедуп по общему id).
//  - Monocraft self-hosted: /public/fonts/Monocraft.woff2, @font-face в globals.css.
//
// Реестр шрифтов (FONTS/FontId/hrefs/cookie) живёт в ./fonts (server-safe).
export { FONTS, type FontId }

// Один раз вставляет <link rel=stylesheet> для опционального шрифта. No-op если
// шрифт всегда-загружен/self-hosted или уже подгружен (в т.ч. сервером по cookie).
function ensureFontLoaded(font: FontId): void {
  if (typeof document === 'undefined') return
  const href = OPTIONAL_FONT_HREFS[font]
  if (!href) return
  const id = fontLinkId(font)
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
}

const STORAGE_KEY = 'energos_prefs'
const SCHEMA_VERSION = 1

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
    if (!isFontId(parsed.font)) return { v: SCHEMA_VERSION, font: DEFAULT_FONT }
    return { v: SCHEMA_VERSION, font: parsed.font }
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
  // Дублируем шрифт в cookie, чтобы сервер отдал нужный <link> на первом рендере.
  try {
    document.cookie = `${FONT_COOKIE}=${encodeURIComponent(prefs.font)}; path=/; max-age=31536000; samesite=lax`
  } catch {
    // document недоступен
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
    // Синкаем cookie из localStorage: существующие юзеры (выбрали шрифт до
    // появления cookie) получают её здесь → со следующей загрузки сервер
    // отдаёт <link> сам, без FOUT.
    writePrefs(prefs)
  }, [])

  const setFont = useCallback((newFont: FontId) => {
    setFontState(newFont)
    applyFont(newFont)
    writePrefs({ v: SCHEMA_VERSION, font: newFont })
  }, [])

  return { font, setFont }
}
