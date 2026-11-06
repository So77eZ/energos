import { describe, expect, it } from 'vitest'
import { changeTasteRange, countTasteFilters, parseTasteFilters, writeTasteFilters } from './taste-filters'

describe('taste filter URL', () => {
  it('restores all six independent taste ranges', () => {
    const params = new URLSearchParams('taste_acidity=2-4&taste_sweetness=1-2&taste_carbonation=3-5&taste_concentration=2-2&taste_aftertaste=4-5&taste_price_quality=1-4')

    expect(parseTasteFilters(params)).toEqual({
      acidity: [2, 4], sweetness: [1, 2], carbonation: [3, 5],
      concentration: [2, 2], aftertaste: [4, 5], price_quality: [1, 4],
    })
  })

  it.each(['', '0-3', '2-6', '4-2', 'NaN-5', '2.5-4', '2-4-5', '2-', '-3', ' 2-4', '2e0-4', '1-5'])('ignores inactive or malformed range %j', (range) => {
    const params = new URLSearchParams({ taste_acidity: range, taste_sweetness: '2-4', taste_unknown: '2-3' })

    expect(parseTasteFilters(params)).toEqual({ sweetness: [2, 4] })
  })

  it('writes active ranges and removes reset ranges without losing other parameters', () => {
    const params = new URLSearchParams('sort=rating_desc&taste_acidity=2-3&taste_sweetness=2-4')
    writeTasteFilters(params, { sweetness: [1, 5], aftertaste: [3, 5] })

    expect(params.toString()).toBe('sort=rating_desc&taste_aftertaste=3-5')
    expect(parseTasteFilters(params)).toEqual({ aftertaste: [3, 5] })
    expect(countTasteFilters({ acidity: [1, 5], sweetness: [2, 4], aftertaste: [3, 5] })).toBe(2)

    writeTasteFilters(params, {})
    expect(params.toString()).toBe('sort=rating_desc')
  })
})

describe('taste range controls', () => {
  it('starts from the full range and keeps the other taste criteria', () => {
    expect(changeTasteRange({ acidity: [2, 4] }, 'sweetness', 0, 3)).toEqual({ acidity: [2, 4], sweetness: [3, 5] })
    expect(changeTasteRange({}, 'sweetness', 1, 2)).toEqual({ sweetness: [1, 2] })
  })

  it('moves the opposite bound when the selected value crosses it', () => {
    expect(changeTasteRange({ sweetness: [1, 2] }, 'sweetness', 0, 4)).toEqual({ sweetness: [4, 4] })
    expect(changeTasteRange({ sweetness: [4, 5] }, 'sweetness', 1, 2)).toEqual({ sweetness: [2, 2] })
  })

  it('removes a taste criterion when both bounds reach the full range', () => {
    expect(changeTasteRange({ acidity: [2, 4], sweetness: [2, 5] }, 'sweetness', 0, 1)).toEqual({ acidity: [2, 4] })
    expect(changeTasteRange({ sweetness: [1, 4] }, 'sweetness', 1, 5)).toEqual({})
  })
})
