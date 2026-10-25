export interface EggState {
  logoClicks: number
  lightning: string[]
}

// Каждая молния должна быть на странице, доступной в проде: иначе «собрать все» невозможно.
// 'auth' заменила 'submit' — страница заявок выключена флагом и отдаёт 404.
export const LIGHTNING_IDS = [
  'hero', 'catalog', 'drink', 'glossary', 'tier',
  'compare', 'tastemap', 'auth', 'profile', 'footer',
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

/** Тост после найденной молнии: сколько собрано, что ещё есть и ради чего искать. */
export function lightningProgressMsg(found: number, achievementName: string): string {
  const total = LIGHTNING_IDS.length
  return `Молния ${found}/${total} — осталось найти ${total - found}. Собери все и получишь «${achievementName}»`
}

export function allLightningFound(s: EggState): boolean {
  return LIGHTNING_IDS.every((id) => s.lightning.includes(id))
}
