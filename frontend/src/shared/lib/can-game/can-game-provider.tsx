'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@shared/lib/toast'
import { ACHIEVEMENT_BY_ID } from '@entities/achievement'
import { toastAchievement, markSeen } from '@shared/lib/achievement-toasts'
import { readCanGame, writeCanGame, type CanGameState } from './can-storage'
import { registerBurst, evaluateCanBadges, type CanRuntime } from './can-core'

interface CanGameValue {
  onBurst: (m: { spinUpMs: number }) => void
  hydrated: boolean
}

const Ctx = createContext<CanGameValue | null>(null)

/** metric из evaluateCanBadges → id бейджа. */
const BADGE_FOR_METRIC = {
  canBursts: 'can-demolitionist',
  canFastSpin: 'can-turbine',
  canCascade: 'can-chain',
} as const

export function CanGameProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const stateRef = useRef<CanGameState>({ bursts: 0, bestSpinUpMs: null, maxCascade: 0 })
  const runtimeRef = useRef<CanRuntime>({ prevBurstAt: null, currentCascade: 0 })

  // init из localStorage (client)
  useEffect(() => {
    stateRef.current = readCanGame()
    setHydrated(true)
  }, [])

  const onBurst = useCallback(({ spinUpMs }: { spinUpMs: number }) => {
    const before = evaluateCanBadges(stateRef.current)
    const res = registerBurst(stateRef.current, runtimeRef.current, { spinUpMs, now: Date.now() })
    stateRef.current = res.state
    runtimeRef.current = res.runtime
    writeCanGame(res.state)
    const after = evaluateCanBadges(res.state)
    // Дифф: метрика впервые пересекла target своего бейджа → тост + markSeen.
    ;(Object.keys(BADGE_FOR_METRIC) as (keyof typeof BADGE_FOR_METRIC)[]).forEach((metric) => {
      const id = BADGE_FOR_METRIC[metric]
      const ach = ACHIEVEMENT_BY_ID[id]
      if (!ach) return
      if (before[metric] < ach.target && after[metric] >= ach.target) {
        toastAchievement(ach, { toast, router })
        markSeen(id)
      }
    })
  }, [toast, router])

  return <Ctx.Provider value={{ onBurst, hydrated }}>{children}</Ctx.Provider>
}

export function useCanGame(): CanGameValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCanGame must be used within CanGameProvider')
  return ctx
}
