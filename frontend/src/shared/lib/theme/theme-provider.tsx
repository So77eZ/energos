'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ACCENT_MAP, DEFAULT_PREFS, STORAGE_KEY } from './constants'
import type { Accent, Motion, Theme, ThemePrefs } from './types'

interface ThemeContextValue extends ThemePrefs {
  setTheme: (t: Theme) => void
  setAccent: (a: Accent) => void
  setLiquidBg: (v: boolean) => void
  setGrain: (v: boolean) => void
  setScanlines: (v: boolean) => void
  setMotion: (v: Motion) => void
  setGachapon: (v: boolean) => void
  update: (patch: Partial<ThemePrefs>) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyToDOM(prefs: ThemePrefs) {
  const html = document.documentElement
  html.setAttribute('data-theme', prefs.theme)
  const accent = ACCENT_MAP[prefs.accent]
  html.style.setProperty('--accent', accent.hex)
  html.style.setProperty('--accent-rgb', accent.rgb)
  // 'always' → атрибут, на который скоупится reduced-motion CSS (отключает заморозку).
  html.toggleAttribute('data-force-motion', prefs.motion === 'always')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULT_PREFS)
  const hydrated = useRef(false)
  const firstApply = useRef(true)
  const prevTheme = useRef<Theme>(DEFAULT_PREFS.theme)

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

    // Crossfade only on an explicit dark↔light switch (not the first hydration
    // apply, not accent/toggle changes). View Transitions API убирает резкий
    // flash; где не поддержано или у юзера reduced-motion — применяем мгновенно
    // (поведение как раньше, без регресса).
    const themeChanged = prevTheme.current !== prefs.theme
    prevTheme.current = prefs.theme
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (themeChanged && !firstApply.current && !reduced && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => applyToDOM(prefs))
    } else {
      applyToDOM(prefs)
    }
    firstApply.current = false

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
    setMotion: (v) => update({ motion: v }),
    setGachapon: (v) => update({ gachapon: v }),
    update,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
