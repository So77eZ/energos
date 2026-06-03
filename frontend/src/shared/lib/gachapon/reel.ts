import type { EnrichedDrink } from '@entities/drink'

const LOOPS = 7
const TAIL = 3 // хвост после выигрыша для «перелёта»
// Потолок длины ленты. Каждая ячейка — DOM-нода с EnergyCan, а видно ~5 разом,
// поэтому при большом каталоге LOOPS×пул раздувает DOM без пользы (83 напитка →
// 581 нода). Кап ограничивает реальную длину, визуально спина хватает с запасом.
// Малые пулы (LOOPS×пул ≤ CAP) не трогаем — поведение прежнее.
export const STRIP_CAP = 64

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

/** Лента для слот-машины: перемешанный пул до целевой длины, выигрыш у хвоста. */
export function buildSpin(drinks: EnrichedDrink[], rng: () => number = Math.random): SpinResult | null {
  if (drinks.length === 0) return null
  const winner = drinks[Math.floor(rng() * drinks.length)]
  const targetLen = Math.min(LOOPS * drinks.length, STRIP_CAP)
  const strip: EnrichedDrink[] = []
  while (strip.length < targetLen) {
    const shuffled = shuffle(drinks, rng)
    for (const d of shuffled) {
      if (strip.length >= targetLen) break
      strip.push(d)
    }
  }
  const winIndex = targetLen - TAIL
  strip[winIndex] = winner
  return { strip, winIndex, winner }
}
