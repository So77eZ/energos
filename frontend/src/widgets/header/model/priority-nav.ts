export interface VisibleCountInput {
  /** Ширины пунктов в порядке приоритета (включая nav-gap). */
  itemWidths: number[]
  /** Ширина кнопки «Ещё» (включая nav-gap). */
  moreWidth: number
  /** Доступная под пункты ширина. */
  available: number
  /** «Ещё» присутствует всегда (напр. под гачапон). Сейчас false. */
  pinMore: boolean
}

/**
 * Сколько пунктов помещается в строку. Остаток уходит в «Ещё».
 * Ширина «Ещё» закладывается в расчёт (если есть overflow или pinMore) —
 * это убирает осцилляцию visible↔overflow. Минимум 1 видимый при непустом списке.
 */
export function computeVisibleCount(input: VisibleCountInput): number {
  const { itemWidths, moreWidth, available, pinMore } = input
  if (itemWidths.length === 0) return 0

  const total = itemWidths.reduce((a, b) => a + b, 0)
  if (total + (pinMore ? moreWidth : 0) <= available) {
    return itemWidths.length
  }

  let used = moreWidth
  let count = 0
  for (const w of itemWidths) {
    if (used + w <= available) {
      used += w
      count++
    } else break
  }
  return Math.max(1, count)
}
