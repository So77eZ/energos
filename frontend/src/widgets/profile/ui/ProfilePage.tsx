'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import type { Drink } from '@entities/drink'
import { cleanDrinkName, EnergyCan, enrichDrinks } from '@entities/drink'
import type { Review } from '@entities/review'
import { calcRating, MiniMetrics } from '@entities/review'
import type { User } from '@entities/user'
import { logoutAction } from '@features/auth/model/actions'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'

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

function pluralize(n: number, one: string, few: string, many: string): string {
  const last = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return many
  if (last === 1) return one
  if (last >= 2 && last <= 4) return few
  return many
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function ProfilePage({ user, reviews, drinks }: ProfilePageProps) {
  const router = useRouter()
  const drinkMap = useMemo(() => new Map(drinks.map((d) => [d.id, d])), [drinks])
  const enrichedMap = useMemo(() => {
    const enriched = enrichDrinks(drinks, [])
    return new Map(enriched.map((d) => [d.id, d]))
  }, [drinks])

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + calcRating(r), 0) / reviews.length
    : 0
  const ratedDrinkIds = new Set(reviews.map((r) => r.energy_drink_id))
  const maxRated = reviews.filter((r) => r.rating === 5).length
  const avatarColor = pickAvatarColor(user.id)
  const isAdmin = user.role === 'admin'
  const letter = user.username.charAt(0).toUpperCase()

  return (
    <div className="page page-profile">
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
            <span>
              <Icons.msg w={12} /> {reviews.length} {pluralize(reviews.length, 'отзыв', 'отзыва', 'отзывов')}
            </span>
            <span>
              <Icons.beaker w={12} /> {ratedDrinkIds.size} из {drinks.length}
            </span>
          </div>
        </div>
        <div className="prof-actions">
          <form action={logoutAction}>
            <button type="submit" className="cta-ghost cta-danger">
              <Icons.lock /> Выйти
            </button>
          </form>
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
        <div className="stat-card stat-pink">
          <div className="stat-icon"><Icons.star /></div>
          <div className="stat-lbl">СРЕДНЯЯ ОЦЕНКА</div>
          <div className="stat-val">{reviews.length > 0 ? avgRating.toFixed(1) : '—'}</div>
          <div className="stat-sub">по моим отзывам</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon"><Icons.beaker /></div>
          <div className="stat-lbl">НАПИТКОВ ОЦЕНЕНО</div>
          <div className="stat-val">{ratedDrinkIds.size}</div>
          <div className="stat-sub">из {drinks.length}</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><Icons.trophy /></div>
          <div className="stat-lbl">МАКС. ОЦЕНОК</div>
          <div className="stat-val">{maxRated}</div>
          <div className="stat-sub">пятёрок</div>
          <div className="stat-corner" />
        </div>
      </section>

      <section className="prof-section">
        <div className="section-head">
          <h2 className="section-title">
            <Icons.msg /> Мои отзывы
          </h2>
          <Link href={ROUTES.home} className="section-link">
            + Добавить <Icons.arrow w={10} />
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="empty">
            <Icons.beaker />
            <p>
              Вы ещё не оставили ни одного отзыва — <Link href={ROUTES.home} style={{ color: 'var(--accent)' }}>выберите напиток</Link>, чтобы начать.
            </p>
          </div>
        ) : (
          <div className="prof-rev-list">
            {reviews.map((r) => {
              const drink = drinkMap.get(r.energy_drink_id)
              const enriched = enrichedMap.get(r.energy_drink_id)
              const cleanedName = drink ? cleanDrinkName(drink.name) : `Напиток #${r.energy_drink_id}`
              const openDrink = () => router.push(ROUTES.reviews(r.energy_drink_id))
              const openEdit = (e: React.MouseEvent) => {
                e.stopPropagation()
                router.push(`${ROUTES.reviews(r.energy_drink_id)}&review=1`)
              }
              return (
                <div
                  key={r.id}
                  className="prof-rev"
                  role="link"
                  tabIndex={0}
                  onClick={openDrink}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDrink()}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="prof-rev-can">
                    {drink?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={drink.image_url} alt={drink.name} style={{ maxHeight: 108, width: 'auto', objectFit: 'contain' }} />
                    ) : enriched ? (
                      <EnergyCan can={enriched.can} w={50} h={108} />
                    ) : null}
                  </div>
                  <div className="prof-rev-info">
                    <div className="prof-rev-name">{cleanedName}</div>
                    <div className="prof-rev-meta">
                      <span>{formatDate(r.updated_at ?? r.created_at)}</span>
                      <span>·</span>
                      <Icons.star w={10} /> {r.rating.toFixed(1)}
                    </div>
                    {r.comment && <p className="prof-rev-comment">«{r.comment}»</p>}
                  </div>
                  <div className="prof-rev-metrics">
                    <MiniMetrics metrics={r} />
                  </div>
                  <button
                    type="button"
                    className="prof-rev-edit"
                    aria-label="Изменить отзыв"
                    onClick={openEdit}
                  >
                    <Icons.edit />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
