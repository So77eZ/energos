import type { EvaluatedAchievement } from '@entities/achievement'

export interface UnlockPlan {
  toToast: string[]
  nextSeen: string[]
}

/** seen===null → первый запуск: seed всех unlocked без тостов. */
export function planUnlockToasts(evaluated: EvaluatedAchievement[], seen: string[] | null): UnlockPlan {
  const unlocked = evaluated.filter((a) => a.unlocked).map((a) => a.id)
  if (seen === null) {
    return { toToast: [], nextSeen: unlocked }
  }
  const seenSet = new Set(seen)
  const toToast = unlocked.filter((id) => !seenSet.has(id))
  const nextSeen = [...new Set([...seen, ...unlocked])]
  return { toToast, nextSeen }
}
