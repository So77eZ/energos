import { describe, it, expect } from 'vitest'
import { timeAgo } from './time-ago'

const NOW = new Date('2026-06-01T12:00:00Z').getTime()
const ago = (sec: number) => new Date(NOW - sec * 1000).toISOString()

describe('timeAgo', () => {
  it('меньше минуты → «только что»', () => {
    expect(timeAgo(ago(30), NOW)).toBe('только что')
  })
  it('минуты с правильным склонением', () => {
    expect(timeAgo(ago(60), NOW)).toBe('1 мин назад')
    expect(timeAgo(ago(300), NOW)).toBe('5 мин назад')
  })
  it('часы со склонением', () => {
    expect(timeAgo(ago(3600), NOW)).toBe('1 час назад')
    expect(timeAgo(ago(2 * 3600), NOW)).toBe('2 часа назад')
    expect(timeAgo(ago(5 * 3600), NOW)).toBe('5 часов назад')
  })
  it('дни со склонением', () => {
    expect(timeAgo(ago(24 * 3600), NOW)).toBe('1 день назад')
    expect(timeAgo(ago(2 * 24 * 3600), NOW)).toBe('2 дня назад')
    expect(timeAgo(ago(5 * 24 * 3600), NOW)).toBe('5 дней назад')
  })
  it('null/мусор → пустая строка', () => {
    expect(timeAgo(null, NOW)).toBe('')
    expect(timeAgo('не-дата', NOW)).toBe('')
  })
})
