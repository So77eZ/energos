import { describe, it, expect } from 'vitest'
import { evaluateAchievements, topBadgeIds, ACHIEVEMENTS } from './achievements'
import type { AchievementStats } from './types'

const ZERO: AchievementStats = {
  reviewsCount: 0, favoritesCount: 0, submissionsCount: 0, approvedSubmissionsCount: 0,
  reviewsWithComments: 0, avgSweetnessX10: 0, nightReviews: 0, tiersCovered: 0,
  firstReviewerCount: 0, emojiGivenCount: 0, isTop10: 0,
  logoManiac: 0, pathfinder: 0,
  canBursts: 0, canFastSpin: 0, canCascade: 0,
}

describe('evaluateAchievements', () => {
  it('21 бейдж', () => {
    expect(ACHIEVEMENTS).toHaveLength(21)
    expect(evaluateAchievements(ZERO)).toHaveLength(21)
  })

  it('client-порог: 5 отзывов разблокирует «Дегустатор», прогресс 100', () => {
    const r = evaluateAchievements({ ...ZERO, reviewsCount: 5 })
    const deg = r.find((a) => a.id === 'five-reviews')!
    expect(deg.unlocked).toBe(true)
    expect(deg.progress).toBe(100)
  })

  it('частичный прогресс округляется и кап 100', () => {
    const r = evaluateAchievements({ ...ZERO, reviewsCount: 3 })
    expect(r.find((a) => a.id === 'twenty-reviews')!.progress).toBe(15) // 3/20
    const big = evaluateAchievements({ ...ZERO, favoritesCount: 99 })
    expect(big.find((a) => a.id === 'ten-favs')!.progress).toBe(100)
  })

  it('Сладкоежка: avgSweetnessX10 41 (>4.0) разблокирует, 40 — нет', () => {
    expect(evaluateAchievements({ ...ZERO, avgSweetnessX10: 41 }).find((a) => a.id === 'sweet-tooth')!.unlocked).toBe(true)
    expect(evaluateAchievements({ ...ZERO, avgSweetnessX10: 40 }).find((a) => a.id === 'sweet-tooth')!.unlocked).toBe(false)
  })

  it('backend-метрика 0 → awaitingBackend, >0 снимает флаг', () => {
    const zero = evaluateAchievements(ZERO).find((a) => a.id === 'top10')!
    expect(zero.awaitingBackend).toBe(true)
    expect(zero.unlocked).toBe(false)
    const got = evaluateAchievements({ ...ZERO, isTop10: 1 }).find((a) => a.id === 'top10')!
    expect(got.awaitingBackend).toBe(false)
    expect(got.unlocked).toBe(true)
  })

  it('client-бейдж не помечается awaitingBackend даже при 0', () => {
    expect(evaluateAchievements(ZERO).find((a) => a.id === 'first-review')!.awaitingBackend).toBe(false)
  })

  it('secret-бейджи: 21 всего; logoManiac=1 разблокирует «Логотипоман», awaitingBackend=false', () => {
    expect(ACHIEVEMENTS).toHaveLength(21)
    const r = evaluateAchievements({ ...ZERO, logoManiac: 1 })
    const m = r.find((a) => a.id === 'logo-maniac')!
    expect(m.unlocked).toBe(true)
    expect(m.source).toBe('secret')
    expect(m.awaitingBackend).toBe(false)
  })

  it('can-бейджи: canBursts=10 разблокирует «Подрывник»; каскад/турбина бинарны', () => {
    const r = evaluateAchievements({ ...ZERO, canBursts: 10, canFastSpin: 1, canCascade: 1 })
    expect(r.find((a) => a.id === 'can-demolitionist')!.unlocked).toBe(true)
    expect(r.find((a) => a.id === 'can-turbine')!.unlocked).toBe(true)
    expect(r.find((a) => a.id === 'can-chain')!.unlocked).toBe(true)
    expect(r.find((a) => a.id === 'can-chain')!.source).toBe('secret')
    expect(r.find((a) => a.id === 'can-demolitionist')!.awaitingBackend).toBe(false)
    expect(evaluateAchievements({ ...ZERO, canBursts: 5 }).find((a) => a.id === 'can-demolitionist')!.progress).toBe(50)
    expect(evaluateAchievements({ ...ZERO, canBursts: 9 }).find((a) => a.id === 'can-demolitionist')!.unlocked).toBe(false)
  })
})

describe('topBadgeIds', () => {
  it('сортирует по престижу (elite>gold>silver>bronze), берёт N', () => {
    const top = topBadgeIds(['first-review', 'top10', 'twenty-reviews'], 2) // bronze, elite, gold
    expect(top.map((b) => b.id)).toEqual(['top10', 'twenty-reviews'])
  })

  it('неизвестные id отфильтрованы, пустой → []', () => {
    expect(topBadgeIds(['nope', 'first-review'])).toHaveLength(1)
    expect(topBadgeIds([])).toEqual([])
  })
})
