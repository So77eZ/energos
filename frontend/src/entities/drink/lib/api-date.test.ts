import { describe, expect, it } from 'vitest'
import { toUtcIso } from './api-date'

describe('toUtcIso', () => {
  it('наивная дата бэка → UTC (добавляется Z)', () => {
    expect(toUtcIso('2026-10-10T12:59:25.267857')).toBe('2026-10-10T12:59:25.267857Z')
  })

  it('результат разбирается как UTC, а не как локальное время', () => {
    expect(Date.parse(toUtcIso('2026-10-10T12:59:25')!)).toBe(Date.UTC(2026, 9, 10, 12, 59, 25))
  })

  it('строки с зоной не меняются', () => {
    expect(toUtcIso('2026-10-10T12:59:25Z')).toBe('2026-10-10T12:59:25Z')
    expect(toUtcIso('2026-10-10T15:59:25+03:00')).toBe('2026-10-10T15:59:25+03:00')
    expect(toUtcIso('2026-10-10T15:59:25-0500')).toBe('2026-10-10T15:59:25-0500')
  })

  it('пусто → null', () => {
    expect(toUtcIso(null)).toBeNull()
    expect(toUtcIso(undefined)).toBeNull()
    expect(toUtcIso('')).toBeNull()
  })
})
