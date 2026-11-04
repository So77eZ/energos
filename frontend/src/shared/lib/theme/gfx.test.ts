import { describe, it, expect } from 'vitest'
import { isSlowFrames } from './gfx'

describe('isSlowFrames', () => {
  it('60 и 30 кадров/с — не медленно', () => {
    expect(isSlowFrames(Array(60).fill(16.7))).toBe(false)
    expect(isSlowFrames(Array(30).fill(33.3))).toBe(false)
  })

  it('5 кадров/с — медленно', () => {
    expect(isSlowFrames(Array(15).fill(200))).toBe(true)
  })

  it('редкие подвисания на быстрой отрисовке не в счёт (медиана)', () => {
    expect(isSlowFrames([...Array(50).fill(16.7), ...Array(10).fill(300)])).toBe(false)
  })

  it('нет кадров — нет данных', () => {
    expect(isSlowFrames([])).toBe(false)
  })
})
