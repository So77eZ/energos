'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ACCENT_MAP, DEFAULT_PREFS, STORAGE_KEY } from './constants'
import type { Accent, Theme, ThemePrefs } from './types'

interface ThemeContextValue extends ThemePrefs {
  setTheme: (t: Theme) => void
  setAccent: (a: Accent) => void
  setLiquidBg: (v: boolean) => void
  setGrain: (v: boolean) => void
  setScanlines: (v: boolean) => void
  update: (patch: Partial<ThemePrefs>) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyToDOM(prefs: ThemePrefs) {
  const html = document.documentElement
  html.setAttribute('data-theme', prefs.theme)
  const accent = ACCENT_MAP[prefs.accent]
  html.style.setProperty('--accent', accent.hex)
  html.style.setProperty('--accent-rgb', accent.rgb)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULT_PREFS)
  const hydrated = useRef(false)

  // Hydrate from storage once on mount. The inline init script already applied
  // theme/accent visually — this brings state into React.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<ThemePrefs>) })
    } catch {}
    hydrated.current = true
  }, [])

  // Apply + persist on any change after hydration.
  useEffect(() => {
    if (!hydrated.current) return
    applyToDOM(prefs)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [prefs])

  const update = useCallback((patch: Partial<ThemePrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: ThemeContextValue = {
    ...prefs,
    setTheme: (t) => update({ theme: t }),
    setAccent: (a) => update({ accent: a }),
    setLiquidBg: (v) => update({ liquidBg: v }),
    setGrain: (v) => update({ grain: v }),
    setScanlines: (v) => update({ scanlines: v }),
    update,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
