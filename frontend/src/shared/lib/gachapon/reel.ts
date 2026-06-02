import type { EnrichedDrink } from '@entities/drink'

const LOOPS = 7
const TAIL = 3 // хвост после выигрыша для «перелёта»

export interface SpinResult {
  strip: EnrichedDrink[]
  winIndex: number
  winner: EnrichedDrink
}

function shuffle(arr: EnrichedDrink[], rng: () => number): EnrichedDrink[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Лента для слот-машины: LOOPS× перемешанный пул, выигрыш у хвоста. */
export function buildSpin(drinks: EnrichedDrink[], rng: () => number = Math.random): SpinResult | null {
  if (drinks.length === 0) return null
  const winner = drinks[Math.floor(rng() * drinks.length)]
  let strip: EnrichedDrink[] = []
  for (let i = 0; i < LOOPS; i++) strip = strip.concat(shuffle(drinks, rng))
  const winIndex = strip.length - TAIL
  strip[winIndex] = winner
  return { strip, winIndex, winner }
}
