const KEY = 'ach_seen'
const SEEDED = 'ach_seeded'

export function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function writeSeen(ids: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* приват/SSR */ }
}

export function markSeen(id: string): void {
  const cur = readSeen()
  if (cur.includes(id)) return
  writeSeen([...cur, id])
}

/** Был ли уже выполнен первый full-seed (отделено от набора seen: яйца пишут
 *  в seen через markSeen, но это НЕ должно считаться за «уже сидено»). */
export function isSeeded(): boolean {
  try { return localStorage.getItem(SEEDED) === '1' } catch { return false }
}

export function markSeeded(): void {
  try { localStorage.setItem(SEEDED, '1') } catch { /* приват/SSR */ }
}
