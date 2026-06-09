export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'elite'
export type AchievementSource = 'client' | 'backend' | 'secret'

export interface AchievementStats {
  reviewsCount: number
  favoritesCount: number
  submissionsCount: number
  approvedSubmissionsCount: number
  reviewsWithComments: number
  avgSweetnessX10: number   // средняя сладость ×10; 0 если <3 отзывов
  nightReviews: number      // отзывы в 0:00–4:00 (локально)
  tiersCovered: number      // 0..5 различных тиров
  firstReviewerCount: number // backend
  emojiGivenCount: number    // backend
  isTop10: number            // backend, 0|1
  logoManiac: number         // secret, 0|1 (100 кликов лого)
  pathfinder: number         // secret, 0|1 (10 молний)
  canBursts: number          // secret, счётчик взрывов банок (клик-разгон)
  canFastSpin: number        // secret, 0|1 — взрыв за ≤ 2с
  canCascade: number         // secret, 0|1 — 5 взрывов подряд
}

export interface Achievement {
  id: string
  name: string
  desc: string
  tier: AchievementTier
  source: AchievementSource
  metric: keyof AchievementStats
  target: number
}

export interface EvaluatedAchievement extends Achievement {
  unlocked: boolean
  progress: number   // 0-100
  awaitingBackend: boolean
}

export const TIER_RANK: Record<AchievementTier, number> =
  { elite: 4, gold: 3, silver: 2, bronze: 1 }
