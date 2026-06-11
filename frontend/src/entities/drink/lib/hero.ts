import type { EnrichedDrink } from './enrich'

/** Hero — напиток с наивысшим рейтингом среди тех, у кого есть хотя бы один отзыв. */
export function pickHero(drinks: EnrichedDrink[]): EnrichedDrink | null {
  const candidates = drinks.filter((d) => d.rating != null && d.reviewCount > 0)
  if (candidates.length === 0) return null
  return candidates.reduce((best, d) => (d.rating! > best.rating! ? d : best))
}
