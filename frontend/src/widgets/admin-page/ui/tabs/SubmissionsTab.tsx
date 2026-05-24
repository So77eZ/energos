'use client'

import { useMemo, useState } from 'react'
import type { Submission, SubmissionStatus } from '@entities/submission'
import { useConfirm } from '@shared/lib/confirm'
import { useSubmissions } from '@shared/lib/submissions'
import { Icons } from '@shared/ui/icons'
import type { IconName } from '@shared/ui/icons'

type FilterId = SubmissionStatus | 'all'

const FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: 'pending',  label: 'В очереди' },
  { id: 'approved', label: 'Одобренные' },
  { id: 'rejected', label: 'Отклонённые' },
  { id: 'all',      label: 'Все' },
]

const STATUS_META: Record<SubmissionStatus, { lbl: string; icon: IconName }> = {
  pending:  { lbl: 'В ОЧЕРЕДИ',   icon: 'beaker' },
  approved: { lbl: 'ОДОБРЕНО',    icon: 'check' },
  rejected: { lbl: 'ОТКЛОНЕНО',   icon: 'x' },
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function SubmissionsTab() {
  const { all, updateStatus } = useSubmissions()
  const confirm = useConfirm()
  const [filter, setFilter] = useState<FilterId>('pending')

  const filtered = useMemo(() => {
    if (filter === 'all') return all
    return all.filter((s) => s.status === filter)
  }, [all, filter])

  async function approve(s: Submission) {
    const ok = await confirm({
      title: 'Одобрить заявку?',
      body: `«${s.drink_name}» будет добавлен в каталог. Заполни остальные поля в карточке напитка после одобрения.`,
      confirmLabel: 'Одобрить',
    })
    if (ok) updateStatus(s.id, 'approved')
  }

  async function reject(s: Submission) {
    const ok = await confirm({
      title: 'Отклонить заявку?',
      body: `Заявка «${s.drink_name}» от ${s.user_name} будет отклонена.`,
      confirmLabel: 'Отклонить',
      danger: true,
    })
    if (ok) updateStatus(s.id, 'rejected', 'Не прошло модерацию')
  }

  return (
    <>
      <div className="adm-sub-head">
        <div className="adm-sub-filters" role="tablist" aria-label="Фильтр заявок">
          {FILTERS.map((f) => {
            const count = f.id === 'all' ? all.length : all.filter((s) => s.status === f.id).length
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`adm-sub-filter${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="adm-sub-filter-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty" style={{ padding: '60px 20px' }}>
          <Icons.beaker />
          <p>Нет заявок в этом разделе.</p>
        </div>
      ) : (
        <div className="adm-sub-list">
          {filtered.map((s) => (
            <AdminSubmissionCard
              key={s.id}
              sub={s}
              onApprove={() => approve(s)}
              onReject={() => reject(s)}
            />
          ))}
        </div>
      )}
    </>
  )
}

interface CardProps {
  sub: Submission
  onApprove: () => void
  onReject: () => void
}

function AdminSubmissionCard({ sub, onApprove, onReject }: CardProps) {
  const meta = STATUS_META[sub.status]
  const StatusIcon = Icons[meta.icon]
  return (
    <article className={`sub-card sub-${sub.status}`}>
      <div className="sub-card-photo">
        {sub.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sub.photo} alt={sub.drink_name} />
        ) : (
          <div className="sub-card-photo-placeholder">
            <Icons.flask w={28} />
            <span>нет фото</span>
          </div>
        )}
      </div>
      <div className="sub-card-body">
        <div className="sub-card-head">
          <h3 className="sub-card-name">{sub.drink_name}</h3>
          <span className={`sub-status sub-status-${sub.status}`}>
            <StatusIcon w={10} /> {meta.lbl}
          </span>
        </div>
        <div className="sub-card-meta">
          <span className="sub-user">
            <span className="sub-user-avatar">{sub.user_name.charAt(0).toUpperCase()}</span>
            {sub.user_name}
          </span>
          <span className="dot" />
          <span>{formatDate(sub.created_at)}</span>
          {sub.price != null && (
            <>
              <span className="dot" />
              <span className="sub-price">{sub.price.toFixed(2)} ₽</span>
            </>
          )}
        </div>
        {sub.comment && <p className="sub-comment">«{sub.comment}»</p>}
        {sub.reject_reason && (
          <p className="sub-reject-reason">
            <Icons.x w={11} /> {sub.reject_reason}
          </p>
        )}
        {sub.status === 'pending' && (
          <div className="sub-actions">
            <button type="button" className="cta-ghost" onClick={onReject}>
              <Icons.x w={12} /> Отклонить
            </button>
            <button type="button" className="cta-primary" onClick={onApprove}>
              <Icons.check w={12} /> Одобрить
            </button>
          </div>
        )}
        {sub.status !== 'pending' && sub.resolved_at && (
          <div className="sub-resolved">
            <span className="sub-resolved-lbl">
              {sub.status === 'approved' ? 'одобрено' : 'отклонено'} · {formatDate(sub.resolved_at)}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
