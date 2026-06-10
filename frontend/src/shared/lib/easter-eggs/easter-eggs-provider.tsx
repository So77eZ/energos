'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@shared/lib/toast'
import { ACHIEVEMENT_BY_ID } from '@entities/achievement'
import { toastAchievement, markSeen } from '@entities/achievement'
import { matchKonami, KONAMI } from './konami'
import { readEggs, writeEggs, collectLightning, allLightningFound } from './eggs-storage'
import { Fireworks } from './Fireworks'

interface EasterEggsValue {
  registerLogoClick: () => void
  collect: (id: string) => void
  found: (id: string) => boolean
  retro: boolean
  hydrated: boolean
}

const Ctx = createContext<EasterEggsValue | null>(null)

const MILESTONES = new Set([25, 50, 75])

/** keydown в текстовом поле не должен кормить konami-буфер. */
function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

export function EasterEggsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const [retro, setRetro] = useState(false)
  const [fireworks, setFireworks] = useState(false)
  const [lightning, setLightning] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const retroRef = useRef(false)
  const keysRef = useRef<string[]>([])

  // init из localStorage (client)
  useEffect(() => {
    const s = readEggs()
    setLightning(s.lightning)
    setHydrated(true)
  }, [])

  // konami
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      keysRef.current = [...keysRef.current, e.key].slice(-KONAMI.length)
      if (matchKonami(keysRef.current)) {
        keysRef.current = []
        // side-effects ВНЕ state-updater (StrictMode дважды вызывает updater).
        const next = !retroRef.current
        retroRef.current = next
        setRetro(next)
        document.documentElement.toggleAttribute('data-retro', next)
        toast(next ? '🕹 SECRET MODE' : 'retro выкл')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toast])

  const registerLogoClick = useCallback(() => {
    // localStorage — источник истины (без дрейфа ref между вкладками/гонок).
    const s = readEggs()
    const n = s.logoClicks + 1
    writeEggs({ ...s, logoClicks: n })
    if (MILESTONES.has(n)) toast(`Логотип кликнут ${n} раз…`)
    if (n === 100) {
      setFireworks(true)
      const ach = ACHIEVEMENT_BY_ID['logo-maniac']
      if (ach) { toastAchievement(ach, { toast, router }); markSeen('logo-maniac') }
    }
  }, [toast, router])

  const collect = useCallback((id: string) => {
    const s = readEggs()
    const next = collectLightning(s, id)
    if (next === s) return
    writeEggs(next)
    setLightning(next.lightning)
    if (allLightningFound(next)) {
      const ach = ACHIEVEMENT_BY_ID['pathfinder']
      if (ach) { toastAchievement(ach, { toast, router }); markSeen('pathfinder') }
    } else {
      toast(`⚡ Молния ${next.lightning.length}/10`)
    }
  }, [toast, router])

  const found = useCallback((id: string) => lightning.includes(id), [lightning])

  return (
    <Ctx.Provider value={{ registerLogoClick, collect, found, retro, hydrated }}>
      {children}
      {fireworks && <Fireworks onDone={() => setFireworks(false)} />}
    </Ctx.Provider>
  )
}

export function useEasterEggs(): EasterEggsValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useEasterEggs must be used within EasterEggsProvider')
  return ctx
}
