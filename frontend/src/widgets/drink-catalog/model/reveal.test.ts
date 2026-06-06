import { describe, it, expect } from 'vitest'
import { nextRevealCount, initialRevealCount } from './reveal'

describe('nextRevealCount', () => {
  it('добавляет chunk', () => {
    expect(nextRevealCount(12, 12, 100)).toBe(24)
  })
  it('кап на total', () => {
    expect(nextRevealCount(96, 12, 100)).toBe(100)
    expect(nextRevealCount(100, 12, 100)).toBe(100)
  })
})

describe('initialRevealCount', () => {
  it('null → min(chunk, total)', () => {
    expect(initialRevealCount(null, 12, 100)).toBe(12)
    expect(initialRevealCount(null, 12, 5)).toBe(5)
  })
  it('restored ниже chunk → chunk', () => {
    expect(initialRevealCount(3, 12, 100)).toBe(12)
  })
  it('restored выше total → total', () => {
    expect(initialRevealCount(500, 12, 100)).toBe(100)
  })
  it('валидный restored сохраняется', () => {
    expect(initialRevealCount(48, 12, 100)).toBe(48)
  })
})
