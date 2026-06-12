import { describe, it, expect, vi } from 'vitest'
import { shapePath, AVATAR_SHAPES } from './shape-path'

// jsdom без canvas-2d → мок-ctx, проверяем что форма вызывает нужные path-методы.
function mockCtx() {
  return {
    beginPath: vi.fn(), arc: vi.fn(), arcTo: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), closePath: vi.fn(),
  } as unknown as CanvasRenderingContext2D & Record<string, ReturnType<typeof vi.fn>>
}

describe('shape-path', () => {
  it('формы определены', () => {
    expect(AVATAR_SHAPES).toEqual(['circle', 'rounded', 'hex'])
  })
  it('circle → arc', () => {
    const c = mockCtx(); shapePath(c, 'circle', 50, 50, 80)
    expect(c.arc).toHaveBeenCalledTimes(1)
    expect(c.lineTo).not.toHaveBeenCalled()
  })
  it('rounded → arcTo (скруглённые углы)', () => {
    const c = mockCtx(); shapePath(c, 'rounded', 50, 50, 80)
    expect((c.arcTo as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(4)
    expect(c.arc).not.toHaveBeenCalled()
  })
  it('hex → 6 точек (1 moveTo + 5 lineTo) + closePath', () => {
    const c = mockCtx(); shapePath(c, 'hex', 50, 50, 80)
    expect(c.moveTo).toHaveBeenCalledTimes(1)
    expect((c.lineTo as ReturnType<typeof vi.fn>).mock.calls.length).toBe(5)
    expect(c.closePath).toHaveBeenCalled()
  })
})
