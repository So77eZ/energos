'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { evaluateAchievements } from '@entities/achievement'
import type { Drink } from '@entities/drink'
import { enrichDrinks, tierFromRating } from '@entities/drink'
import { calcRating, type Review } from '@entities/review'
import type { User } from '@entities/user'
import { logoutAction } from '@features/auth/model/actions'
import { readEggs, allLightningFound } from '@shared/lib/easter-eggs'
import { readCanGame, evaluateCanBadges } from '@shared/lib/can-game'
import { HiddenBolt } from '@shared/ui/HiddenBolt'
import { ROUTES } from '@shared/config/routes'
import { useToast } from '@shared/lib/toast'
import { notifyUnlocks } from '@entities/achievement'
import { useFavorites } from '@shared/lib/favorites'
import { useMySubmissions } from '@shared/lib/submissions'
import { Icons } from '@shared/ui/icons'
import { AchievementsTab } from './tabs/AchievementsTab'
import { AppearanceTab } from './tabs/AppearanceTab'
import { FavoritesTab } from './tabs/FavoritesTab'
import { ReviewsTab } from './tabs/ReviewsTab'
import { SubmissionsTab } from './tabs/SubmissionsTab'

type TabId = 'reviews' | 'favorites' | 'submissions' | 'achievements' | 'appearance'

const TAB_IDS: TabId[] = ['reviews', 'favorites', 'submissions', 'achievements', 'appearance']

interface ProfilePageProps {
  user: User
  reviews: Review[]
  drinks: Drink[]
}

const AVATAR_COLORS = ['var(--c-cyan)', 'var(--c-pink)', 'var(--c-green)', 'var(--c-amber)', 'var(--c-purple)']

function pickAvatarColor(seed: string | number): string {
  const s = String(seed)
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function parseTab(raw: string | null): TabId {
  if (raw && (TAB_IDS as string[]).includes(raw)) return raw as TabId
  return 'reviews'
}

export function ProfilePage({ user, reviews, drinks }: ProfilePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabId>(() => parseTab(searchParams.get('tab')))

  // Sync URL ?tab=... when tab changes (scroll: false чтобы не дёргать страницу).
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'reviews') params.delete('tab')
    else params.set('tab', tab)
    const qs = params.toString()
    router.replace(qs ? `${ROUTES.profile}?${qs}` : ROUTES.profile, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const drinkMap = useMemo(() => new Map(drinks.map((d) => [d.id, d])), [drinks])
  const enrichedAll = useMemo(() => enrichDrinks(drinks, []), [drinks])
  const enrichedMap = useMemo(() => new Map(enrichedAll.map((d) => [d.id, d])), [enrichedAll])

  const { favorites: favIds } = useFavorites()
  const favDrinks = useMemo(
    () => favIds.map((id) => enrichedMap.get(id)).filter((d): d is NonNullable<typeof d> => Boolean(d)),
    [favIds, enrichedMap],
  )

  const mySubs = useMySubmissions(user.id)
  const pendingCount = mySubs.filter((s) => s.status === 'pending').length
  const approvedCount = mySubs.filter((s) => s.status === 'approved').length

  // Секретные egg-флаги из localStorage (client) → в stats бейджей.
  const [eggFlags, setEggFlags] = useState({ logoManiac: 0, pathfinder: 0 })
  useEffect(() => {
    const s = readEggs()
    setEggFlags({ logoManiac: s.logoClicks >= 100 ? 1 : 0, pathfinder: allLightningFound(s) ? 1 : 0 })
  }, [])

  // Секретные can-game-флаги из localStorage (client) → в stats бейджей.
  const [canFlags, setCanFlags] = useState({ canBursts: 0, canFastSpin: 0, canCascade: 0 })
  useEffect(() => {
    setCanFlags(evaluateCanBadges(readCanGame()))
  }, [])

  const achievements = useMemo(() => {
    const reviewsWithComments = reviews.filter((r) => r.comment?.trim()).length
    const avgSweetnessX10 = reviews.length >= 3
      ? Math.round((reviews.reduce((acc, r) => acc + r.sweetness, 0) / reviews.length) * 10)
      : 0
    const nightReviews = reviews.filter((r) => {
      if (!r.created_at) return false
      // created_at — наивный UTC (без оффсета); добавляем Z, чтобы Date не принял
      // его за локальное. getHours() затем даёт локальный час инстанта (ночь юзера).
      const iso = r.created_at.endsWith('Z') ? r.created_at : `${r.created_at}Z`
      const h = new Date(iso).getHours()
      return h >= 0 && h < 4
    }).length
    // Тир по СОБСТВЕННОЙ оценке юзера (глобальный тир напитка требует всех отзывов,
    // которых на клиенте нет). «Универсал» = отзывы во всех тирах по своим оценкам.
    const tiersCovered = new Set(
      reviews.map((r) => tierFromRating(calcRating(r))).filter(Boolean),
    ).size
    return evaluateAchievements({
      reviewsCount: reviews.length,
      favoritesCount: favIds.length,
      submissionsCount: mySubs.length,
      approvedSubmissionsCount: approvedCount,
      reviewsWithComments,
      avgSweetnessX10,
      nightReviews,
      tiersCovered,
      firstReviewerCount: user.first_reviewer_count ?? 0,
      emojiGivenCount: user.emoji_given_count ?? 0,
      isTop10: user.is_top10 ? 1 : 0,
      logoManiac: eggFlags.logoManiac,
      pathfinder: eggFlags.pathfinder,
      canBursts: canFlags.canBursts,
      canFastSpin: canFlags.canFastSpin,
      canCascade: canFlags.canCascade,
    })
  }, [reviews, favIds.length, mySubs.length, approvedCount, user, eggFlags, canFlags])
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  // Тост на новые анлоки (diff vs ach_seen; первый визит — silent seed).
  const { toast } = useToast()
  useEffect(() => {
    notifyUnlocks(achievements, { toast, router })
  }, [achievements, toast, router])

  // appearance исключён — у вкладки нет badge'а со счётчиком (это настройки).
  const counts: Record<Exclude<TabId, 'appearance'>, string | number> = {
    reviews: reviews.length,
    favorites: favIds.length,
    submissions: mySubs.length,
    achievements: `${unlockedCount}/${achievements.length}`,
  }

  const avatarColor = pickAvatarColor(user.id)
  const isAdmin = user.role === 'admin'
  const letter = user.username.charAt(0).toUpperCase()

  return (
    <div className="page page-profile">
      <HiddenBolt id="profile" />
      <section className="prof-hero">
        <div
          className="prof-hero-bg"
          style={{ background: `radial-gradient(ellipse at 30% 50%, ${avatarColor}22, transparent 60%)` }}
        />
        <div className="prof-avatar" style={{ background: avatarColor }}>
          <span className="prof-avatar-letter">{letter}</span>
        </div>
        <div className="prof-info">
          <div className="prof-eyebrow">
            <span className={`prof-role-tag${isAdmin ? '' : ' prof-role-user'}`}>
              {isAdmin ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
            </span>
          </div>
          <h1 className="prof-name">{user.username}</h1>
          <div className="prof-meta">
            <span><Icons.msg w={12} /> {reviews.length} отзывов</span>
            <span><Icons.bolt w={12} /> {favIds.length} в избранном</span>
            <span><Icons.beaker w={12} /> {mySubs.length} заявок</span>
            <span><Icons.award w={12} /> {unlockedCount}/{achievements.length}</span>
          </div>
        </div>
        <div className="prof-actions">
          <button
            type="button"
            className="cta-ghost cta-danger"
            onClick={async () => {
              await logoutAction()
              window.location.href = '/'
            }}
          >
            <Icons.lock /> Выйти
          </button>
        </div>
      </section>

      <section className="prof-stats">
        <div className="stat-card stat-cyan">
          <div className="stat-icon"><Icons.msg /></div>
          <div className="stat-lbl">ОТЗЫВОВ</div>
          <div className="stat-val">{reviews.length}</div>
          <div className="stat-sub">всего</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><Icons.bolt /></div>
          <div className="stat-lbl">ИЗБРАННЫХ</div>
          <div className="stat-val">{favIds.length}</div>
          <div className="stat-sub">из {drinks.length}</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon"><Icons.beaker /></div>
          <div className="stat-lbl">ЗАЯВКИ</div>
          <div className="stat-val">{mySubs.length}</div>
          <div className="stat-sub">{pendingCount} ждут · {approvedCount} одобрены</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon"><Icons.trophy /></div>
          <div className="stat-lbl">АЧИВКИ</div>
          <div className="stat-val">{unlockedCount}</div>
          <div className="stat-sub">/{achievements.length}</div>
          <div className="stat-corner" />
        </div>
      </section>

      <div className="prof-tabs" role="tablist" aria-label="Разделы профиля">
        <TabButton id="reviews"      label="Отзывы"     icon="msg"     badge={counts.reviews}      active={tab} onSelect={setTab} />
        <TabButton id="favorites"    label="Избранное"  icon="bolt"    badge={counts.favorites}    active={tab} onSelect={setTab} />
        <TabButton id="submissions"  label="Мои заявки" icon="beaker"  badge={counts.submissions}  active={tab} onSelect={setTab} />
        <TabButton id="achievements" label="Достижения" icon="trophy"  badge={counts.achievements} active={tab} onSelect={setTab} />
        <TabButton id="appearance"   label="Оформление" icon="sparkle" active={tab} onSelect={setTab} />
      </div>

      {tab === 'reviews'      && <ReviewsTab reviews={reviews} drinkMap={drinkMap} enrichedMap={enrichedMap} />}
      {tab === 'favorites'    && <FavoritesTab favDrinks={favDrinks} />}
      {tab === 'submissions'  && <SubmissionsTab mySubs={mySubs} />}
      {tab === 'achievements' && <AchievementsTab achievements={achievements} />}
      {tab === 'appearance'   && <AppearanceTab />}
    </div>
  )
}

interface TabButtonProps {
  id: TabId
  label: string
  icon: 'msg' | 'bolt' | 'beaker' | 'trophy' | 'sparkle'
  /** Опционально — вкладка «Оформление» (настройки) бейджа не имеет. */
  badge?: string | number
  active: TabId
  onSelect: (id: TabId) => void
}

function TabButton({ id, label, icon, badge, active, onSelect }: TabButtonProps) {
  const Icon = Icons[icon]
  const isActive = active === id
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`prof-tab${isActive ? ' active' : ''}`}
      onClick={() => onSelect(id)}
    >
      <Icon w={14} />
      <span>{label}</span>
      {badge != null && <span className="prof-tab-badge">{badge}</span>}
    </button>
  )
}
