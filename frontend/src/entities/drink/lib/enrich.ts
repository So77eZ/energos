import { METRIC_KEYS } from '@entities/review/@x/drink'
import type { ReviewMetrics } from '@entities/review/@x/drink'
import type { Tier } from '@shared/model/tier'
import type { Drink } from '../model/types'
import type { CanSpec } from '../ui/EnergyCan'

export type { Tier }

export interface EnrichedDrink extends Drink {
  rating: number | null
  reviewCount: number
  metrics: ReviewMetrics | null
  /** Comma-separated RGB tuple (e.g. "0,229,255") suitable for `rgba()`. */
  blend: string
  tier: Tier | null
  isNew: boolean
  /** Derived can colors. Mock for now — real source TBD. */
  can: CanSpec
}

/** RGB tuples per metric — same order as METRIC_KEYS. */
const METRIC_RGB: ReadonlyArray<[number, number, number]> = [
  [0, 229, 255],   // acidity     — cyan
  [77, 150, 255],  // sweetness   — blue
  [255, 46, 136],  // carbonation — pink
  [192, 132, 252], // concentration — purple
  [251, 191, 36],  // aftertaste  — amber
  [0, 255, 157],   // price_quality — green
]

const DEFAULT_BLEND_RGB: [number, number, number] = [77, 150, 255]
const NEW_WINDOW_DAYS = 14

export function blendMetricRGB(metrics: ReviewMetrics | null): string {
  if (!metrics) return DEFAULT_BLEND_RGB.join(',')
  let r = 0, g = 0, b = 0, w = 0
  METRIC_KEYS.forEach((key, i) => {
    const v = metrics[key]
    r += METRIC_RGB[i][0] * v
    g += METRIC_RGB[i][1] * v
    b += METRIC_RGB[i][2] * v
    w += v
  })
  if (w === 0) return DEFAULT_BLEND_RGB.join(',')
  return `${Math.round(r / w)},${Math.round(g / w)},${Math.round(b / w)}`
}

export function tierFromRating(rating: number | null): Tier | null {
  if (rating == null) return null
  if (rating >= 4.5) return 'S'
  if (rating >= 4.0) return 'A'
  if (rating >= 3.0) return 'B'
  if (rating >= 2.0) return 'C'
  return 'D'
}

export function isFreshDrink(createdAt: string | null, windowDays = NEW_WINDOW_DAYS): boolean {
  if (!createdAt) return false
  const created = Date.parse(createdAt)
  if (!Number.isFinite(created)) return false
  return Date.now() - created < windowDays * 24 * 60 * 60 * 1000
}

function canFromBlend(blend: string, drink: Drink): CanSpec {
  const code = `EN-${String(drink.id).padStart(3, '0')}`
  // Body color: dark mix. Stripe + accent: tinted by blend.
  return {
    body: '#13141c',
    stripe: `rgb(${blend})`,
    accent: '#ffffff',
    label: drink.no_sugar ? 'ZERO' : 'CLASSIC',
    code,
  }
}

/** Рейтинг, число отзывов и средние метрики приходят с бэка в  (). */
export function enrichDrink(drink: Drink): EnrichedDrink {
  const { rating, reviewsCount, metrics } = drink.stats
  const blend = blendMetricRGB(metrics)
  return {
    ...drink,
    rating,
    reviewCount: reviewsCount,
    metrics,
    blend,
    tier: tierFromRating(rating),
    isNew: isFreshDrink(drink.created_at),
    can: canFromBlend(blend, drink),
  }
}

export function enrichDrinks(drinks: Drink[]): EnrichedDrink[] {
  return drinks.map(enrichDrink)
}
