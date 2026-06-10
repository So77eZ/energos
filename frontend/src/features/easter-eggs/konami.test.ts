import { describe, it, expect } from 'vitest'
import { matchKonami, KONAMI } from './konami'

describe('matchKonami', () => {
  it('точная последовательность → true', () => {
    expect(matchKonami([...KONAMI])).toBe(true)
  })
  it('хвост длинного буфера совпадает → true (лишние клавиши до)', () => {
    expect(matchKonami(['a', 'x', 'Enter', ...KONAMI])).toBe(true)
  })
  it('регистр b/a игнорируется', () => {
    const seq = [...KONAMI.slice(0, 8), 'B', 'A']
    expect(matchKonami(seq)).toBe(true)
  })
  it('неполная/неверная → false', () => {
    expect(matchKonami(KONAMI.slice(1))).toBe(false)
    expect(matchKonami(['ArrowDown', ...KONAMI.slice(1)])).toBe(false)
    expect(matchKonami([])).toBe(false)
  })
})
