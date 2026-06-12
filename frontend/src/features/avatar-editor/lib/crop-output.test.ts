import { describe, it, expect } from 'vitest'
import { outputSize, OUTPUT_CAP } from './crop-output'

// Чистая логика кап-размера. getCroppedImg/loadOriented (canvas/createImageBitmap)
// в jsdom не работают — проверяются визуально (T9).
describe('crop-output', () => {
  it('кап выходного размера = 512', () => {
    expect(OUTPUT_CAP).toBe(512)
  })
  it('больше капа → 512', () => {
    expect(outputSize(1200)).toBe(512)
  })
  it('меньше капа → как есть (округлённо)', () => {
    expect(outputSize(300)).toBe(300)
    expect(outputSize(299.6)).toBe(300)
  })
})
