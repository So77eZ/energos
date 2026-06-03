import { describe, it, expect } from 'vitest'
import { buildSpin, STRIP_CAP } from './reel'
import type { EnrichedDrink } from '@entities/drink'

// Минимальные «напитки» — buildSpin использует только идентичность объектов.
const drink = (id: number) => ({ id, name: `D${id}` }) as unknown as EnrichedDrink
const DRINKS = [drink(1), drink(2), drink(3), drink(4)]

// Детерминированный rng: всегда 0 → target = drinks[0], shuffle стабилен.
const rng0 = () => 0

describe('buildSpin', () => {
  it('пустой пул → null', () => {
    expect(buildSpin([], rng0)).toBeNull()
  })
  it('strip длиной LOOPS*n', () => {
    const r = buildSpin(DRINKS, rng0)!
    expect(r.strip).toHaveLength(7 * DRINKS.length)
  })
  it('winIndex = strip.length - 3 и там лежит winner', () => {
    const r = buildSpin(DRINKS, rng0)!
    expect(r.winIndex).toBe(r.strip.length - 3)
    expect(r.strip[r.winIndex]).toBe(r.winner)
  })
  it('winner из пула', () => {
    const r = buildSpin(DRINKS, rng0)!
    expect(DRINKS).toContain(r.winner)
  })
  it('strip — только элементы пула (без потерь/чужаков)', () => {
    const r = buildSpin(DRINKS, rng0)!
    for (const d of r.strip) expect(DRINKS).toContain(d)
  })
  it('большой пул → длина ленты ограничена STRIP_CAP', () => {
    const big = Array.from({ length: 20 }, (_, i) => drink(i + 1)) // 7*20=140 > cap
    const r = buildSpin(big, rng0)!
    expect(r.strip).toHaveLength(STRIP_CAP)
    expect(r.winIndex).toBe(STRIP_CAP - 3)
    expect(r.strip[r.winIndex]).toBe(r.winner)
    for (const d of r.strip) expect(big).toContain(d)
  })
})
