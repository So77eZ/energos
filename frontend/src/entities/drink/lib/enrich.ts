import { calcRating, METRIC_KEYS } from '@entities/review'
import type { Review, ReviewMetrics } from '@entities/review'
import type { Drink } from '../model/types'
import type { CanSpec } from '../ui/EnergyCan'

export type Tier = 'S' | 'A' | 'B' | 'C' | 'D'

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

function aggregateMetrics(reviews: Review[]): ReviewMetrics | null {
  if (reviews.length === 0) return null
  const admin = reviews.find((r) => r.from_admin)
  if (admin) {
    return {
      acidity: admin.acidity,
      sweetness: admin.sweetness,
      carbonation: admin.carbonation,
      concentration: admin.concentration,
      aftertaste: admin.aftertaste,
      price_quality: admin.price_quality,
    }
  }
  const sum: ReviewMetrics = { acidity: 0, sweetness: 0, carbonation: 0, concentration: 0, aftertaste: 0, price_quality: 0 }
  for (const r of reviews) {
    sum.acidity += r.acidity
    sum.sweetness += r.sweetness
    sum.carbonation += r.carbonation
    sum.concentration += r.concentration
    sum.aftertaste += r.aftertaste
    sum.price_quality += r.price_quality
  }
  const n = reviews.length
  return {
    acidity: sum.acidity / n,
    sweetness: sum.sweetness / n,
    carbonation: sum.carbonation / n,
    concentration: sum.concentration / n,
    aftertaste: sum.aftertaste / n,
    price_quality: sum.price_quality / n,
  }
}

function aggregateRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null
  const admin = reviews.find((r) => r.from_admin)
  if (admin) return calcRating(admin)
  const avg = reviews.reduce((s, r) => s + calcRating(r), 0) / reviews.length
  return Math.round(avg * 10) / 10
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

export function enrichDrink(drink: Drink, reviews: Review[]): EnrichedDrink {
  const own = reviews.filter((r) => r.energy_drink_id === drink.id)
  const metrics = aggregateMetrics(own)
  const rating = aggregateRating(own)
  const blend = blendMetricRGB(metrics)
  return {
    ...drink,
    rating,
    reviewCount: own.length,
    metrics,
    blend,
    tier: tierFromRating(rating),
    isNew: isFreshDrink(drink.created_at),
    can: canFromBlend(blend, drink),
  }
}

export function enrichDrinks(drinks: Drink[], reviews: Review[]): EnrichedDrink[] {
  // Index reviews by drink id once for O(n+m) total.
  const byDrink = new Map<number, Review[]>()
  for (const r of reviews) {
    const list = byDrink.get(r.energy_drink_id)
    if (list) list.push(r)
    else byDrink.set(r.energy_drink_id, [r])
  }
  return drinks.map((d) => {
    const own = byDrink.get(d.id) ?? []
    const metrics = aggregateMetrics(own)
    const rating = aggregateRating(own)
    const blend = blendMetricRGB(metrics)
    return {
      ...d,
      rating,
      reviewCount: own.length,
      metrics,
      blend,
      tier: tierFromRating(rating),
      isNew: isFreshDrink(d.created_at),
      can: canFromBlend(blend, d),
    }
  })
}
