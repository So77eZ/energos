import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Drink } from '../model/types'
import { enrichDrinks, isFreshDrink } from './enrich'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-07T12:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('isFreshDrink', () => {
  it.each([
    ['2026-11-07T12:00:00.000Z', true],
    ['2026-10-31T12:00:00.001Z', true],
    ['2026-10-31T12:00:00.000Z', false],
    ['2026-10-26T18:35:42.214118Z', false],
    ['2026-11-07T12:00:00.001Z', false],
    ['invalid', false],
    ['', false],
    [null, false],
  ])('marks %s as new only within the last seven days: %s', (createdAt, expected) => {
    expect(isFreshDrink(createdAt)).toBe(expected)
  })

  it('interprets API dates without a timezone as UTC near the cutoff', () => {
    vi.stubEnv('TZ', 'America/New_York')

    expect(isFreshDrink('2026-10-31T11:59:59.999999')).toBe(false)
    expect(isFreshDrink('2026-10-31T12:00:00.001000')).toBe(true)
  })

  it('compares explicit offsets as instants', () => {
    expect(isFreshDrink('2026-10-31T15:00:00.000+03:00')).toBe(false)
    expect(isFreshDrink('2026-10-31T07:00:00.001-0500')).toBe(true)
  })
})

describe('enrichDrinks', () => {
  it('uses creation dates for NEW even when an old drink was just updated', () => {
    const base: Drink = {
      id: 1, name: 'Drink', price: null, image_url: null, no_sugar: false,
      created_at: '2026-10-26T18:35:42.214118Z',
      updated_at: '2026-11-07T11:00:00.000Z',
      stats: { rating: null, reviewsCount: 0, metrics: null },
    }

    const drinks = enrichDrinks([
      base,
      { ...base, id: 2, created_at: '2026-11-07T11:00:00.000Z' },
    ])

    expect(drinks.map((drink) => drink.isNew)).toEqual([false, true])
  })
})
