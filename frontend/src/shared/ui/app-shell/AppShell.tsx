'use client'

import type { ReactNode } from 'react'
import { useTheme } from '@shared/lib/theme'
import { AgeGate } from '@widgets/age-gate/ui/AgeGate'
import { TweaksPanel } from '@widgets/tweaks-panel/ui/TweaksPanel'

export function AppShell({ children }: { children: ReactNode }) {
  const { liquidBg, grain, scanlines } = useTheme()
  const cls = ['app', grain && 'has-grain', scanlines && 'has-scan'].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      {liquidBg && (
        <div className="liquid-bg" aria-hidden="true">
          <div className="lb-blob lb-1" />
          <div className="lb-blob lb-2" />
          <div className="lb-blob lb-3" />
          <div className="lb-blob lb-4" />
          <div className="lb-grid" />
        </div>
      )}
      {children}
      <TweaksPanel />
      <AgeGate />
    </div>
  )
}
