// Static list. Backend ачивок ещё не существует — задаём здесь.
// При появлении реального API: типы сохранятся, источник переедет на fetch.

import type { Achievement, AchievementStats, EvaluatedAchievement } from './types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-review',  name: 'Первый отзыв',         desc: 'Оставь свой первый отзыв на любой напиток.',
    icon: 'msg',     hue: 'cyan',   metric: 'reviewsCount',  target: 1 },
  { id: 'five-reviews',  name: 'Активный рецензент',   desc: 'Оставь 5 отзывов — голос комьюнити становится слышнее.',
    icon: 'pulse',   hue: 'pink',   metric: 'reviewsCount',  target: 5 },
  { id: 'twenty-reviews',name: 'Эксперт по вкусам',    desc: '20 отзывов. Тебя слышно во всех тирах.',
    icon: 'award',   hue: 'amber',  metric: 'reviewsCount',  target: 20 },
  { id: 'first-fav',     name: 'Любимое сохранено',    desc: 'Отметь первый напиток молнией.',
    icon: 'bolt',    hue: 'amber',  metric: 'favoritesCount', target: 1 },
  { id: 'ten-favs',      name: 'Коллекционер',         desc: '10 напитков в избранном — у тебя есть вкус.',
    icon: 'sparkle', hue: 'purple', metric: 'favoritesCount', target: 10 },
  { id: 'first-submit',  name: 'Поделился находкой',   desc: 'Отправь первую заявку на новый напиток.',
    icon: 'beaker',  hue: 'cyan',   metric: 'submissionsCount', target: 1 },
  { id: 'approved-submit', name: 'Принято в каталог',  desc: 'Хотя бы одна твоя заявка одобрена админом.',
    icon: 'check',   hue: 'green',  metric: 'approvedSubmissionsCount', target: 1 },
  { id: 'three-approved', name: 'Каталогист',          desc: '3 одобренных заявки. Каталог пополняется тобой.',
    icon: 'flask',   hue: 'lime',   metric: 'approvedSubmissionsCount', target: 3 },
]

export function evaluateAchievements(stats: AchievementStats): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const value = stats[a.metric]
    const progress = Math.min(100, Math.round((value / a.target) * 100))
    return { ...a, unlocked: value >= a.target, progress }
  })
}
