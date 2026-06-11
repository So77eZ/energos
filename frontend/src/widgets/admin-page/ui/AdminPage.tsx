'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { ROUTES } from '@shared/config/routes'
import { useSubmissions } from '@features/submissions'
import { Icons } from '@shared/ui/icons'
import { CatalogTab } from './tabs/CatalogTab'
import { LeadersTab } from './tabs/LeadersTab'
import { SubmissionsTab } from './tabs/SubmissionsTab'

type TabId = 'catalog' | 'subs' | 'leaders'

const TAB_IDS: TabId[] = ['catalog', 'subs', 'leaders']

interface AdminPageProps {
  drinks: Drink[]
  reviews: Review[]
}

function parseTab(raw: string | null): TabId {
  if (raw && (TAB_IDS as string[]).includes(raw)) return raw as TabId
  return 'catalog'
}

export function AdminPage({ drinks, reviews }: AdminPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<TabId>(() => parseTab(searchParams.get('tab')))

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'catalog') params.delete('tab')
    else params.set('tab', tab)
    const qs = params.toString()
    router.replace(qs ? `${ROUTES.admin.drinks}?${qs}` : ROUTES.admin.drinks, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const { all: submissions } = useSubmissions()
  const pendingCount = submissions.filter((s) => s.status === 'pending').length
  const noSugarCount = drinks.filter((d) => d.no_sugar).length

  return (
    <div className="page page-admin">
      <header className="adm-head">
        <div>
          <div className="page-eyebrow">УПРАВЛЕНИЕ · ADMIN</div>
          <h1 className="page-title">Энергопанель</h1>
          <p className="page-blurb">
            Каталог, заявки от сообщества, рейтинг рецензентов — всё в одном месте.
          </p>
        </div>
      </header>

      <section className="adm-stats">
        <div className="stat-card stat-cyan">
          <div className="stat-icon"><Icons.pkg /></div>
          <div className="stat-lbl">ВСЕГО ПОЗИЦИЙ</div>
          <div className="stat-val">{drinks.length}</div>
          <div className="stat-sub">в каталоге</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><Icons.plus /></div>
          <div className="stat-lbl">ЗАЯВКИ В ОЧЕРЕДИ</div>
          <div className="stat-val">{pendingCount}</div>
          <div className="stat-sub">из {submissions.length} всего</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-lime">
          <div className="stat-icon"><Icons.candyOff /></div>
          <div className="stat-lbl">БЕЗ САХАРА</div>
          <div className="stat-val">{noSugarCount}</div>
          <div className="stat-sub">zero-sugar</div>
          <div className="stat-corner" />
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon"><Icons.msg /></div>
          <div className="stat-lbl">ВСЕГО ОТЗЫВОВ</div>
          <div className="stat-val">{reviews.length}</div>
          <div className="stat-sub">по всему каталогу</div>
          <div className="stat-corner" />
        </div>
      </section>

      <div className="adm-tabs" role="tablist" aria-label="Разделы админки">
        <TabButton id="catalog" label="Каталог"    icon="grid"   active={tab} onSelect={setTab} />
        <TabButton id="subs"    label="Заявки"     icon="plus"   active={tab} onSelect={setTab} badge={pendingCount > 0 ? pendingCount : undefined} />
        <TabButton id="leaders" label="Лидерборд"  icon="trophy" active={tab} onSelect={setTab} />
      </div>

      {tab === 'catalog' && <CatalogTab drinks={drinks} />}
      {tab === 'subs'    && <SubmissionsTab />}
      {tab === 'leaders' && <LeadersTab reviews={reviews} />}
    </div>
  )
}

interface TabButtonProps {
  id: TabId
  label: string
  icon: 'grid' | 'plus' | 'trophy'
  active: TabId
  onSelect: (id: TabId) => void
  badge?: number
}

function TabButton({ id, label, icon, active, onSelect, badge }: TabButtonProps) {
  const Icon = Icons[icon]
  const isActive = active === id
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`adm-tab${isActive ? ' active' : ''}`}
      onClick={() => onSelect(id)}
    >
      <Icon w={14} />
      <span>{label}</span>
      {badge != null && <span className="adm-tab-badge">{badge}</span>}
    </button>
  )
}
