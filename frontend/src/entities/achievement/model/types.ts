import type { IconName } from '@shared/ui/icons'

export type AchievementHue = 'cyan' | 'pink' | 'amber' | 'purple' | 'lime' | 'green'

export interface AchievementStats {
  reviewsCount: number
  favoritesCount: number
  submissionsCount: number
  approvedSubmissionsCount: number
}

export interface Achievement {
  id: string
  name: string
  desc: string
  icon: IconName
  hue: AchievementHue
  /** Threshold required to unlock (relative to a single AchievementStats key). */
  target: number
  /** Which counter to compare against `target`. */
  metric: keyof AchievementStats
}

export interface EvaluatedAchievement extends Achievement {
  unlocked: boolean
  progress: number  // 0-100
}
