// Цвет буквенного аватара от seed (user id/username). Консолидировано из 4 дублей
// (ProfilePage/UserReviewCard/LeadersTab/Header) — единый источник.
export const AVATAR_COLORS = ['var(--c-cyan)', 'var(--c-pink)', 'var(--c-green)', 'var(--c-amber)', 'var(--c-purple)']

export function pickAvatarColor(seed: string | number): string {
  const s = String(seed)
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
