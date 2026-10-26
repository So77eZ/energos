'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FEATURES } from '@shared/config/features'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { ACCENT_MAP, DEFAULT_PREFS, STORAGE_KEY, parseMotion } from './constants'
import type { Accent, Motion, Theme, ThemePrefs } from './types'

interface ThemeContextValue extends ThemePrefs {
  /** Анимации включены сейчас: выбор пользователя, а если не выбирал — системная настройка. */
  motionOn: boolean
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

function applyToDOM(prefs: ThemePrefs, motionOn: boolean) {
  const html = document.documentElement
  html.setAttribute('data-theme', prefs.theme)
  const accent = ACCENT_MAP[prefs.accent]
  html.style.setProperty('--accent', accent.hex)
  html.style.setProperty('--accent-rgb', accent.rgb)
  // Единый источник для CSS: :root[data-motion="off"] замораживает анимации (globals.css).
  html.setAttribute('data-motion', motionOn ? 'on' : 'off')
  // Address-bar (mobile) под цвет фона текущей темы. Читаем реальный --bg-base
  // (data-theme уже выставлен выше) — честно при toggle, без хардкода палитры.
  const bg = getComputedStyle(html).getPropertyValue('--bg-base').trim()
  if (bg) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = bg
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULT_PREFS)
  const hydrated = useRef(false)
  const firstApply = useRef(true)
  const prevTheme = useRef<Theme>(DEFAULT_PREFS.theme)
  const systemReduce = usePrefersReducedMotion()
  const motionOn = prefs.motion ? prefs.motion === 'on' : !systemReduce

  // Hydrate from storage once on mount. The inline init script already applied
  // theme/accent visually — this brings state into React.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw) as Partial<ThemePrefs> & { motion?: unknown }
        setPrefs({ ...DEFAULT_PREFS, ...stored, motion: parseMotion(stored.motion) })
      }
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

    if (themeChanged && !firstApply.current && motionOn && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => applyToDOM(prefs, motionOn))
    } else {
      applyToDOM(prefs, motionOn)
    }
    firstApply.current = false

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [prefs, motionOn])

  const update = useCallback((patch: Partial<ThemePrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const value: ThemeContextValue = {
    ...prefs,
    motionOn,
    // Рулетка вне MVP: без флага её нет в меню независимо от сохранённой настройки пользователя
    // (в localStorage по-прежнему пишется prefs, значение пользователя не теряется).
    gachapon: FEATURES.gachapon && prefs.gachapon,
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
