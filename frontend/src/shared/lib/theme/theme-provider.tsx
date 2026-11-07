'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FEATURES } from '@shared/config/features'
import { usePrefersReducedMotion } from '../usePrefersReducedMotion'
import { ACCENT_MAP, DEFAULT_PREFS, GFX_STORAGE_KEY, STORAGE_KEY, parseMotion, parseTint } from './constants'
import { isSlowFrames, measureFrameDeltas } from './gfx'
import { getAccentColors, normalizeHex } from './accent-color'
import type { Accent, Motion, Theme, ThemePrefs } from './types'

interface ThemeContextValue extends ThemePrefs {
  /** Анимации включены сейчас: выбор пользователя, а если не выбирал — системная настройка
   *  и слабая графика (обе выключают). */
  motionOn: boolean
  /** Слабая графика (<html data-gfx="low">, gfx.ts): тяжёлые эффекты упрощены, 3D-банок нет. */
  lowGfx: boolean
  setTheme: (t: Theme) => void
  setAccent: (a: Accent) => void
  accentSelection: number
  setCustomAccent: (hex: string) => void
  previewAccent: (hex: string | null) => void
  setLiquidBg: (v: boolean) => void
  setGrain: (v: boolean) => void
  setScanlines: (v: boolean) => void
  setMotion: (v: Motion) => void
  setGachapon: (v: boolean) => void
  update: (patch: Partial<ThemePrefs>) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyAccentToDOM(prefs: ThemePrefs, preview: string | null = null) {
  const html = document.documentElement
  const custom = preview ?? (prefs.accent === 'custom' ? prefs.customAccent : null)
  const preset = prefs.accent !== 'custom' && Object.hasOwn(ACCENT_MAP, prefs.accent) ? prefs.accent : 'cyan'
  const accent = custom ? getAccentColors(custom, prefs.theme, prefs.mutedLightAccent) : ACCENT_MAP[preset]
  html.toggleAttribute('data-custom-accent', !!custom)
  if (custom && 'fill' in accent) {
    html.style.setProperty('--accent-fill', accent.fill)
    html.style.setProperty('--accent-custom-foreground', accent.foreground)
    html.style.setProperty('--on-accent', accent.ink)
  } else {
    for (const property of ['--accent-fill', '--accent-custom-foreground', '--on-accent']) html.style.removeProperty(property)
  }
  html.style.setProperty('--accent-source', 'fill' in accent ? accent.fill : accent.hex)
  html.style.setProperty('--accent-rgb', accent.rgb)
}

function applyToDOM(prefs: ThemePrefs, motionOn: boolean, preview: string | null) {
  const html = document.documentElement
  html.setAttribute('data-theme', prefs.theme)
  applyAccentToDOM(prefs, preview)
  html.style.setProperty('--accent-tint', `${prefs.theme === 'light' ? prefs.tintLight : prefs.tintDark}%`)
  html.toggleAttribute('data-tint-cards', prefs.tintCards)
  html.toggleAttribute('data-muted-light-accent', prefs.mutedLightAccent)
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
  const [hydrated, setHydrated] = useState(false)
  const firstApply = useRef(true)
  const prevTheme = useRef<Theme>(DEFAULT_PREFS.theme)
  const prefsRef = useRef(prefs)
  const previewRef = useRef<string | null>(null)
  const [accentSelection, setAccentSelection] = useState(0)
  const systemReduce = usePrefersReducedMotion()
  // false на SSR и первом рендере, как systemReduce; реальное значение — в effect ниже.
  const [lowGfx, setLowGfx] = useState(false)
  const motionOn = prefs.motion ? prefs.motion === 'on' : !(systemReduce || lowGfx)

  // Hydrate from storage once on mount. The inline init script already applied
  // theme/accent visually — this brings state into React.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw) as Partial<ThemePrefs> & { motion?: unknown }
        setPrefs({
          ...DEFAULT_PREFS,
          ...stored,
          accent: stored.accent === 'custom' && normalizeHex(stored.customAccent) ? 'custom'
            : stored.accent !== 'custom' && typeof stored.accent === 'string' && Object.hasOwn(ACCENT_MAP, stored.accent) ? stored.accent : DEFAULT_PREFS.accent,
          customAccent: normalizeHex(stored.customAccent) ?? DEFAULT_PREFS.customAccent,
          motion: parseMotion(stored.motion),
          tintDark: parseTint(stored.tintDark),
          tintLight: parseTint(stored.tintLight),
          tintCards: stored.tintCards === true,
          mutedLightAccent: stored.mutedLightAccent === true,
        })
      }
    } catch {}
    setLowGfx(document.documentElement.getAttribute('data-gfx') === 'low')
    setHydrated(true)
  }, [])

  // Видеокарта есть, но кадры всё равно медленные (слабая встройка, нагруженная машина) —
  // через 2 с после загрузки меряем 3 с кадров и при медленной отрисовке включаем слабую графику.
  // shortcut: решение запоминается навсегда (GFX_STORAGE_KEY), переключателя нет; при ложных
  // срабатываниях — хранить со сроком или дать выключить в настройках.
  useEffect(() => {
    if (document.documentElement.getAttribute('data-gfx') === 'low') return
    let cancelled = false
    let timer = 0
    const run = () => {
      timer = window.setTimeout(async () => {
        const deltas = await measureFrameDeltas(3000)
        if (cancelled || !deltas || !isSlowFrames(deltas)) return
        try { localStorage.setItem(GFX_STORAGE_KEY, 'low') } catch {}
        document.documentElement.setAttribute('data-gfx', 'low')
        setLowGfx(true)
      }, 2000)
    }
    if (document.readyState === 'complete') run()
    else window.addEventListener('load', run, { once: true })
    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('load', run)
    }
  }, [])

  // Apply + persist on any change after hydration.
  useEffect(() => {
    if (!hydrated) return
    prefsRef.current = prefs

    // Crossfade only on an explicit dark↔light switch (not the first hydration
    // apply, not accent/toggle changes). View Transitions API убирает резкий
    // flash; где не поддержано или у юзера reduced-motion — применяем мгновенно
    // (поведение как раньше, без регресса).
    const themeChanged = prevTheme.current !== prefs.theme
    prevTheme.current = prefs.theme
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }

    if (themeChanged && !firstApply.current && motionOn && typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => applyToDOM(prefs, motionOn, previewRef.current))
    } else {
      applyToDOM(prefs, motionOn, previewRef.current)
    }
    firstApply.current = false

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {}
  }, [hydrated, prefs, motionOn])

  const update = useCallback((patch: Partial<ThemePrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }))
  }, [])

  const previewAccent = useCallback((hex: string | null) => {
    previewRef.current = normalizeHex(hex)
    applyAccentToDOM(prefsRef.current, previewRef.current)
  }, [])

  const setCustomAccent = useCallback((hex: string) => {
    const customAccent = normalizeHex(hex)
    if (!customAccent) return
    previewRef.current = null
    const next: ThemePrefs = { ...prefsRef.current, accent: 'custom', customAccent }
    prefsRef.current = next
    applyAccentToDOM(next)
    setPrefs(next)
    setAccentSelection(value => value + 1)
  }, [])

  const setAccent = useCallback((accent: Accent) => {
    previewRef.current = null
    const next = { ...prefsRef.current, accent }
    prefsRef.current = next
    applyAccentToDOM(next)
    setPrefs(next)
    setAccentSelection(value => value + 1)
  }, [])

  const value: ThemeContextValue = {
    ...prefs,
    motionOn,
    lowGfx,
    // Рулетка вне MVP: без флага её нет в меню независимо от сохранённой настройки пользователя
    // (в localStorage по-прежнему пишется prefs, значение пользователя не теряется).
    gachapon: FEATURES.gachapon && prefs.gachapon,
    setTheme: (t) => update({ theme: t }),
    setAccent,
    accentSelection,
    setCustomAccent,
    previewAccent,
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
