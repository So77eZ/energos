'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useToast } from '@shared/lib/toast'
import { matchKonami, KONAMI } from './konami'
import { readEggs, writeEggs, collectLightning, allLightningFound } from './eggs-storage'
import { Fireworks } from './Fireworks'

interface EasterEggsValue {
  registerLogoClick: () => void
  collect: (id: string) => void
  found: (id: string) => boolean
  retro: boolean
}

const Ctx = createContext<EasterEggsValue | null>(null)

const MILESTONES = new Set([25, 50, 75])

export function EasterEggsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [retro, setRetro] = useState(false)
  const [fireworks, setFireworks] = useState(false)
  const [lightning, setLightning] = useState<string[]>([])
  const clicksRef = useRef(0)
  const keysRef = useRef<string[]>([])

  // init из localStorage (client)
  useEffect(() => {
    const s = readEggs()
    clicksRef.current = s.logoClicks
    setLightning(s.lightning)
  }, [])

  // konami
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keysRef.current = [...keysRef.current, e.key].slice(-KONAMI.length)
      if (matchKonami(keysRef.current)) {
        keysRef.current = []
        setRetro((r) => {
          const next = !r
          document.documentElement.toggleAttribute('data-retro', next)
          toast(next ? '🕹 SECRET MODE' : 'retro выкл')
          return next
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toast])

  const registerLogoClick = useCallback(() => {
    const n = clicksRef.current + 1
    clicksRef.current = n
    const s = readEggs()
    writeEggs({ ...s, logoClicks: n })
    if (MILESTONES.has(n)) toast(`Логотип кликнут ${n} раз…`)
    if (n === 100) {
      setFireworks(true)
      toast('Ты кликнул логотип 100 раз. У тебя слишком много свободного времени')
    }
  }, [toast])

  const collect = useCallback((id: string) => {
    const s = readEggs()
    const next = collectLightning(s, id)
    if (next === s) return
    writeEggs(next)
    setLightning(next.lightning)
    if (allLightningFound(next)) toast('⚡ Все молнии собраны! Бейдж «Энергетик-следопыт»')
    else toast(`⚡ Молния ${next.lightning.length}/10`)
  }, [toast])

  const found = useCallback((id: string) => lightning.includes(id), [lightning])

  return (
    <Ctx.Provider value={{ registerLogoClick, collect, found, retro }}>
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
