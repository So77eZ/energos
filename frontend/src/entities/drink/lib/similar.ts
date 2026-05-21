import { METRIC_KEYS, type ReviewMetrics } from '@entities/review'
import type { EnrichedDrink } from './enrich'

export interface SimilarMatch {
  drink: EnrichedDrink
  /** Euclidean distance on 6 metric axes (0…sqrt(6·4²) ≈ 9.8). */
  distance: number
  /** Normalized similarity 0…1 — 1 means identical, 0 means maxed out. */
  match: number
}

/** Max theoretical L2 distance between two 1–5 metric vectors of length 6. */
const MAX_DISTANCE = Math.sqrt(METRIC_KEYS.length * 16)

function l2(a: ReviewMetrics, b: ReviewMetrics): number {
  let sum = 0
  for (const k of METRIC_KEYS) {
    const d = a[k] - b[k]
    sum += d * d
  }
  return Math.sqrt(sum)
}

/**
 * Find drinks closest to `target` by Euclidean distance on review metrics.
 * Drinks without computed metrics are skipped — there's nothing to compare.
 */
export function findSimilarDrinks(
  target: EnrichedDrink,
  candidates: EnrichedDrink[],
  limit = 4,
): SimilarMatch[] {
  if (!target.metrics) return []
  const targetMetrics = target.metrics
  return candidates
    .filter((d) => d.id !== target.id && d.metrics != null)
    .map((d) => {
      const distance = l2(d.metrics!, targetMetrics)
      const match = Math.max(0, 1 - distance / MAX_DISTANCE)
      return { drink: d, distance, match }
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
}
