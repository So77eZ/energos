/** Следующее число раскрытых карточек: +chunk, не больше total. */
export function nextRevealCount(current: number, chunk: number, total: number): number {
  return Math.min(current + chunk, total)
}

/** Начальный count: восстановленный (клампим в [chunk, total]) или chunk. */
export function initialRevealCount(restored: number | null, chunk: number, total: number): number {
  const base = restored != null && restored > 0 ? Math.max(restored, chunk) : chunk
  return Math.min(base, total)
}
