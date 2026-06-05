export interface EggState {
  logoClicks: number
  lightning: string[]
}

export const LIGHTNING_IDS = [
  'hero', 'catalog', 'drink', 'glossary', 'tier',
  'compare', 'tastemap', 'submit', 'profile', 'footer',
] as const

const KEY = 'energos_eggs'
const EMPTY: EggState = { logoClicks: 0, lightning: [] }

export function readEggs(): EggState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const p = JSON.parse(raw) as Partial<EggState>
    return {
      logoClicks: Number(p.logoClicks) || 0,
      lightning: Array.isArray(p.lightning) ? p.lightning.filter((x): x is string => typeof x === 'string') : [],
    }
  } catch {
    return { ...EMPTY }
  }
}

export function writeEggs(s: EggState): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode / SSR */ }
}

export function collectLightning(s: EggState, id: string): EggState {
  if (!(LIGHTNING_IDS as readonly string[]).includes(id) || s.lightning.includes(id)) return s
  return { ...s, lightning: [...s.lightning, id] }
}

export function allLightningFound(s: EggState): boolean {
  return LIGHTNING_IDS.every((id) => s.lightning.includes(id))
}
