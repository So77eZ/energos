import { describe, it, expect } from 'vitest'
import { buildActivityCalendar } from './activity-calendar'

const NOW = new Date('2026-06-15T12:00:00Z')

// TZ-устойчивость: не ассертим конкретную дату-ключ (зависит от TZ раннера),
// а проверяем агрегацию по бакетам и попадание в диапазон.
function cells(cal: ReturnType<typeof buildActivityCalendar>) {
  return cal.weeks.flat()
}

describe('buildActivityCalendar', () => {
  it('пустой вход → сетка 53×7, total 0, все level 0', () => {
    const cal = buildActivityCalendar([], NOW)
    expect(cal.weeks).toHaveLength(53)
    expect(cal.weeks.every((w) => w.length === 7)).toBe(true)
    expect(cal.total).toBe(0)
    expect(cells(cal).every((c) => c.level === 0 && c.count === 0)).toBe(true)
  })

  it('агрегация: 3 отзыва одной датой → один бакет count=3 level=3', () => {
    const ts = '2026-06-10T10:00:00'
    const cal = buildActivityCalendar([ts, ts, ts], NOW)
    const filled = cells(cal).filter((c) => c.count > 0)
    expect(filled).toHaveLength(1)
    expect(filled[0].count).toBe(3)
    expect(filled[0].level).toBe(3)
    expect(cal.total).toBe(3)
  })

  it('кап уровня: 5 отзывов в день → level 4', () => {
    const ts = '2026-06-10T10:00:00'
    const cal = buildActivityCalendar([ts, ts, ts, ts, ts], NOW)
    const filled = cells(cal).filter((c) => c.count > 0)
    expect(filled[0].count).toBe(5)
    expect(filled[0].level).toBe(4)
  })

  it('вне диапазона: древний отзыв не учтён', () => {
    const cal = buildActivityCalendar(['2020-01-01T10:00:00'], NOW)
    expect(cal.total).toBe(0)
    expect(cells(cal).some((c) => c.count > 0)).toBe(false)
  })

  it('null/невалидные created_at пропускаются', () => {
    const cal = buildActivityCalendar([null, 'not-a-date', '2026-06-10T10:00:00'], NOW)
    expect(cal.total).toBe(1)
  })

  it('будущие дни текущей недели — inRange=false, без подсчёта', () => {
    const cal = buildActivityCalendar([], NOW)
    const future = cells(cal).filter((c) => !c.inRange)
    expect(future.length).toBeGreaterThan(0)
    expect(future.every((c) => c.count === 0)).toBe(true)
  })

  it('monthLabels непустые, индексы в пределах сетки', () => {
    const cal = buildActivityCalendar([], NOW)
    expect(cal.monthLabels.length).toBeGreaterThan(0)
    expect(cal.monthLabels.every((m) => m.index >= 0 && m.index < 53)).toBe(true)
  })
})
