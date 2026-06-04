import type { Achievement, AchievementStats, EvaluatedAchievement } from './types'
import { TIER_RANK } from './types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-review',    name: 'Первый отзыв',      desc: 'Оставь свой первый отзыв.',          tier: 'bronze', source: 'client',  metric: 'reviewsCount',             target: 1 },
  { id: 'five-reviews',    name: 'Дегустатор',        desc: '5 отзывов — голос слышнее.',         tier: 'silver', source: 'client',  metric: 'reviewsCount',             target: 5 },
  { id: 'twenty-reviews',  name: 'Эксперт по вкусам', desc: '20 отзывов во всех тирах.',          tier: 'gold',   source: 'client',  metric: 'reviewsCount',             target: 20 },
  { id: 'first-fav',       name: 'Любимое сохранено', desc: 'Отметь первый напиток молнией.',     tier: 'bronze', source: 'client',  metric: 'favoritesCount',           target: 1 },
  { id: 'ten-favs',        name: 'Коллекционер',      desc: '10 напитков в избранном.',           tier: 'silver', source: 'client',  metric: 'favoritesCount',           target: 10 },
  { id: 'first-submit',    name: 'Поделился находкой',desc: 'Отправь первую заявку.',             tier: 'bronze', source: 'client',  metric: 'submissionsCount',         target: 1 },
  { id: 'approved-submit', name: 'Принято в каталог', desc: 'Твоя заявка одобрена.',              tier: 'silver', source: 'client',  metric: 'approvedSubmissionsCount', target: 1 },
  { id: 'three-approved',  name: 'Каталогист',        desc: '3 одобренных заявки.',               tier: 'gold',   source: 'client',  metric: 'approvedSubmissionsCount', target: 3 },
  { id: 'critic',          name: 'Критик',            desc: '5 отзывов с комментарием.',          tier: 'silver', source: 'client',  metric: 'reviewsWithComments',      target: 5 },
  { id: 'connoisseur',     name: 'Знаток',            desc: '10 отзывов с комментарием.',         tier: 'gold',   source: 'client',  metric: 'reviewsWithComments',      target: 10 },
  { id: 'sweet-tooth',     name: 'Сладкоежка',        desc: 'Средняя сладость выше 4 (от 3 отзывов).', tier: 'silver', source: 'client', metric: 'avgSweetnessX10',     target: 41 },
  { id: 'night-owl',       name: 'Полночная сова',    desc: '5 отзывов между 0:00 и 4:00.',       tier: 'silver', source: 'client',  metric: 'nightReviews',             target: 5 },
  { id: 'universalist',    name: 'Универсал',         desc: 'Отзыв на напиток каждого тира S/A/B/C/D.', tier: 'gold', source: 'client', metric: 'tiersCovered',         target: 5 },
  { id: 'pioneer',         name: 'Первопроходец',     desc: 'Отзыв на напиток без других отзывов.', tier: 'gold',  source: 'backend', metric: 'firstReviewerCount',       target: 1 },
  { id: 'activist',        name: 'Активист',          desc: '5 emoji-реакций другим авторам.',    tier: 'elite',  source: 'backend', metric: 'emojiGivenCount',          target: 5 },
  { id: 'top10',           name: 'Топ-10%',           desc: 'Верхние 10% по числу отзывов.',      tier: 'elite',  source: 'backend', metric: 'isTop10',                  target: 1 },
]

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> =
  Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]))

export function evaluateAchievements(stats: AchievementStats): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const value = stats[a.metric]
    const unlocked = value >= a.target
    const progress = Math.min(100, Math.round((value / a.target) * 100))
    const awaitingBackend = a.source === 'backend' && !unlocked && value === 0
    return { ...a, unlocked, progress, awaitingBackend }
  })
}

/** Топ-N разблокированных бейджей по престижу (для кластера у ника). */
export function topBadgeIds(unlockedIds: string[], n = 3): Achievement[] {
  return unlockedIds
    .map((id) => ACHIEVEMENT_BY_ID[id])
    .filter((a): a is Achievement => Boolean(a))
    .sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])
    .slice(0, n)
}
