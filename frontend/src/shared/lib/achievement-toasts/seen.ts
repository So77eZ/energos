const KEY = 'ach_seen'

/** null — ключа нет (первый запуск); [] — был, но пуст. */
export function readSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return null
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return null
  }
}

export function writeSeen(ids: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch { /* приват/SSR */ }
}

export function markSeen(id: string): void {
  const cur = readSeen() ?? []
  if (cur.includes(id)) return
  writeSeen([...cur, id])
}
