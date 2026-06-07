import type { EvaluatedAchievement } from '@entities/achievement'

export interface UnlockPlan {
  toToast: string[]
  nextSeen: string[]
}

/**
 * `seeded=false` → первый full-seed: вернуть все unlocked в nextSeen БЕЗ тостов
 * (без ретро-спама), сохранив уже известные id (напр. добавленные яйцами).
 * `seeded=true` → тостим только unlocked, которых нет в seen.
 */
export function planUnlockToasts(
  evaluated: EvaluatedAchievement[],
  seen: string[],
  seeded: boolean,
): UnlockPlan {
  const unlocked = evaluated.filter((a) => a.unlocked).map((a) => a.id)
  const nextSeen = [...new Set([...seen, ...unlocked])]
  if (!seeded) return { toToast: [], nextSeen }
  const seenSet = new Set(seen)
  return { toToast: unlocked.filter((id) => !seenSet.has(id)), nextSeen }
}
