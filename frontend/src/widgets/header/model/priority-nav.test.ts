import { describe, it, expect } from 'vitest'
import { computeVisibleCount } from './priority-nav'

const W = [100, 100, 100, 100] // 4 пункта по 100
const MORE = 80

describe('computeVisibleCount', () => {
  it('всё влезает → все видны, «Ещё» не нужен', () => {
    expect(computeVisibleCount({ itemWidths: W, moreWidth: MORE, available: 1000, pinMore: false })).toBe(4)
  })
  it('узко → часть в overflow, в расчёт заложена ширина «Ещё»', () => {
    // available 380: 80 (more) + 100+100+100 = 380 → 3 влезает
    expect(computeVisibleCount({ itemWidths: W, moreWidth: MORE, available: 380, pinMore: false })).toBe(3)
  })
  it('экстремально узко → минимум 1 видимый', () => {
    expect(computeVisibleCount({ itemWidths: W, moreWidth: MORE, available: 10, pinMore: false })).toBe(1)
  })
  it('pinMore=true резервирует «Ещё» даже когда всё влезало бы впритык', () => {
    // total=400, available=400: без pinMore → 4; с pinMore нужно +80 → не влезает → 3
    expect(computeVisibleCount({ itemWidths: W, moreWidth: MORE, available: 400, pinMore: true })).toBe(3)
  })
  it('нет пунктов → 0', () => {
    expect(computeVisibleCount({ itemWidths: [], moreWidth: MORE, available: 1000, pinMore: false })).toBe(0)
  })
})
