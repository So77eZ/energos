'use client'

import { useState, useEffect } from 'react'

export const FONTS = [
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Share Tech Mono', label: 'Share Tech Mono' },
  { id: 'Orbitron', label: 'Orbitron' },
  { id: 'Rajdhani', label: 'Rajdhani' },
  { id: 'Monocraft', label: 'Monocraft' },
] as const

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
  document.documentElement.style.setProperty('--font-sans', `"${font}"`)
}

export function useUserPreferences() {
  const [font, setFontState] = useState<FontId>(DEFAULT_FONT)

  useEffect(() => {
    const prefs = readPrefs()
    setFontState(prefs.font)
    applyFont(prefs.font)
  }, [])

  function setFont(newFont: FontId) {
    setFontState(newFont)
    applyFont(newFont)
    writePrefs({ v: SCHEMA_VERSION, font: newFont })
  }

  return { font, setFont }
}
