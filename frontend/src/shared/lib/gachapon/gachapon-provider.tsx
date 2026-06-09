'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { drinkApi, enrichDrinks, type EnrichedDrink } from '@entities/drink'
import { reviewApi } from '@entities/review'
import { ROUTES } from '@shared/config/routes'
import { useTheme } from '@shared/lib/theme'
import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion'
import { buildSpin } from './reel'
import { GachaponMachine, type GachaponPhase } from './GachaponMachine'

interface GachaponContextValue {
  open: () => void
}

const GachaponContext = createContext<GachaponContextValue | null>(null)

export function GachaponProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { motion } = useTheme()

  const [phase, setPhase] = useState<'idle' | GachaponPhase>('idle')
  const [reel, setReel] = useState<EnrichedDrink[]>([])
  const [winIndex, setWinIndex] = useState(0)
  const [winner, setWinner] = useState<EnrichedDrink | null>(null)
  const [landFrac, setLandFrac] = useState(0)
  const cacheRef = useRef<EnrichedDrink[] | null>(null)
  const openRef = useRef(false)

  const reducedMotion = usePrefersReducedMotion()
  // reduced бьёт системную настройку, кроме «Анимации: всегда вкл.» (motion === 'always').
  const reduced = reducedMotion && motion !== 'always'
  // Длительность спина: momentum-кривая держит динамику, 6с достаточно (был 7 под мёртвый хвост).
  const dur = reduced ? 0.35 : 6

  const startSpin = useCallback((drinks: EnrichedDrink[]) => {
    const spin = buildSpin(drinks)
    if (!spin) {
      setPhase('error')
      return
    }
    setWinner(null)
    setReel(spin.strip)
    setWinIndex(spin.winIndex)
    setLandFrac(spin.landFrac)
    setPhase('spinning')
  }, [])

  const open = useCallback(() => {
    openRef.current = true
    if (cacheRef.current) {
      startSpin(cacheRef.current)
      return
    }
    setPhase('loading')
    Promise.all([drinkApi.list(), reviewApi.list()])
      .then(([drinks, reviews]) => {
        if (!openRef.current) return
        const enriched = enrichDrinks(drinks, reviews)
        cacheRef.current = enriched
        if (enriched.length === 0) {
          setPhase('error')
          return
        }
        startSpin(enriched)
      })
      .catch(() => {
        if (openRef.current) setPhase('error')
      })
  }, [startSpin])

  const close = useCallback(() => {
    openRef.current = false
    setPhase('idle')
    setReel([])
    setWinner(null)
  }, [])

  const land = useCallback((w: EnrichedDrink) => {
    setWinner(w)
    setPhase('landed')
  }, [])

  const respin = useCallback(() => {
    if (cacheRef.current) startSpin(cacheRef.current)
  }, [startSpin])

  const go = useCallback((w: EnrichedDrink) => {
    close()
    router.push(ROUTES.reviews(w.id))
  }, [close, router])

  // Закрыть при смене маршрута.
  useEffect(() => { close() }, [pathname, close])

  // Esc закрывает.
  useEffect(() => {
    if (phase === 'idle') return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase, close])

  return (
    <GachaponContext.Provider value={{ open }}>
      {children}
      {phase !== 'idle' && (
        <GachaponMachine
          phase={phase}
          reel={reel}
          winIndex={winIndex}
          winner={winner}
          dur={dur}
          landFrac={landFrac}
          reduced={reduced}
          onLand={land}
          onRespin={respin}
          onGo={go}
          onClose={close}
        />
      )}
    </GachaponContext.Provider>
  )
}

export function useGachapon(): GachaponContextValue {
  const ctx = useContext(GachaponContext)
  if (!ctx) throw new Error('useGachapon must be used within GachaponProvider')
  return ctx
}
