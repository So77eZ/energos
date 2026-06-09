export interface CanGameState {
  bursts: number
  bestSpinUpMs: number | null
  maxCascade: number
}

const KEY = 'energos_cangame'
const EMPTY: CanGameState = { bursts: 0, bestSpinUpMs: null, maxCascade: 0 }

export function readCanGame(): CanGameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const p = JSON.parse(raw) as Partial<CanGameState>
    return {
      bursts: Number(p.bursts) || 0,
      bestSpinUpMs: typeof p.bestSpinUpMs === 'number' ? p.bestSpinUpMs : null,
      maxCascade: Number(p.maxCascade) || 0,
    }
  } catch {
    return { ...EMPTY }
  }
}

export function writeCanGame(s: CanGameState): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode / SSR */ }
}
