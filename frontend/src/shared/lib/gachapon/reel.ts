import type { EnrichedDrink } from '@entities/drink'

const LOOPS = 7
const TAIL = 5 // хвост после выигрыша: покрывает правый край при проскоке (overshoot ½ ячейки) и лево-смещённом лендинге (до −0.4 ячейки)
// Потолок длины ленты. Каждая ячейка — DOM-нода с EnergyCan, а видно ~5 разом,
// поэтому при большом каталоге LOOPS×пул раздувает DOM без пользы (83 напитка →
// 581 нода). Кап ограничивает реальную длину, визуально спина хватает с запасом.
// Малые пулы (LOOPS×пул ≤ CAP) не трогаем — поведение прежнее.
export const STRIP_CAP = 64

export interface SpinResult {
  strip: EnrichedDrink[]
  winIndex: number
  winner: EnrichedDrink
  landFrac: number // смещение метки внутри ячейки выигрыша, ∈ [-0.4, 0.4]
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
  const landFrac = (rng() - 0.5) * 0.8 // ∈ [-0.4, 0.4]: выигрыш не строго по центру метки (CS2-саспенс)
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
  return { strip, winIndex, winner, landFrac }
}
