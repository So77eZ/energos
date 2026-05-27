'use client'

import Link from 'next/link'
import type { Submission, SubmissionStatus } from '@entities/submission'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import type { IconName } from '@shared/ui/icons'
import { ProfileEmpty } from './ProfileEmpty'

interface SubmissionsTabProps {
  mySubs: Submission[]
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU')
}

interface StatusInfo {
  lbl: string
  icon: IconName
  desc: (sub: Submission) => string
}

const STATUS_INFO: Record<SubmissionStatus, StatusInfo> = {
  pending:  { lbl: 'В ОЧЕРЕДИ',  icon: 'beaker', desc: () => 'Ждёт модерации администратором' },
  approved: { lbl: 'ОДОБРЕНО',   icon: 'check',  desc: () => 'Напиток добавлен в каталог!' },
  rejected: { lbl: 'ОТКЛОНЕНО',  icon: 'x',      desc: (s) => s.reject_reason || 'Причина не указана' },
}

export function SubmissionsTab({ mySubs }: SubmissionsTabProps) {
  if (mySubs.length === 0) {
    return (
      <ProfileEmpty
        icon={<Icons.beaker w={36} />}
        title="Пока нет заявок"
        body="Знаешь напиток, которого нет в каталоге? Расскажи о нём — администратор добавит."
        cta="Предложить напиток"
        href={ROUTES.submit}
      />
    )
  }
  return (
    <section className="prof-section">
      <div className="section-head">
        <h2 className="section-title">Все мои заявки</h2>
        <Link href={ROUTES.submit} className="cta-ghost">
          <Icons.plus w={12} /> Новая заявка
        </Link>
      </div>
      <div className="prof-sub-list">
        {mySubs.map((s) => (
          <MySubmissionCard key={s.id} sub={s} />
        ))}
      </div>
    </section>
  )
}

function MySubmissionCard({ sub }: { sub: Submission }) {
  const info = STATUS_INFO[sub.status]
  const Icon = Icons[info.icon]
  return (
    <article className={`my-sub sub-${sub.status} my-sub-${sub.status}`}>
      {sub.status === 'pending' && (
        <div className="my-sub-photo">
          {sub.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={sub.photo} 
              alt={sub.drink_name} 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div className="my-sub-photo-empty" style={{ display: sub.photo ? 'none' : 'flex' }}>
            <Icons.flask w={22} />
          </div>
        </div>
      )}
      <div className="my-sub-body">
        <div className="my-sub-head">
          <h4 className="my-sub-name">{sub.drink_name}</h4>
          <span className={`sub-status sub-status-${sub.status}`}>
            <Icon w={10} /> {info.lbl}
          </span>
        </div>
        <div className="my-sub-meta">
          <span>#{sub.id}</span>
          <span className="dot" />
          <span>{formatDate(sub.created_at)}</span>
          {sub.price != null && (
            <>
              <span className="dot" />
              <span className="my-sub-price">{sub.price.toFixed(2)} ₽</span>
            </>
          )}
          {sub.resolved_at && (
            <>
              <span className="dot" />
              <span>решено: {formatDate(sub.resolved_at)}</span>
            </>
          )}
        </div>
        {sub.comment && <p className="my-sub-comment">«{sub.comment}»</p>}
        <div className="my-sub-status-row">
          <Icon w={11} />
          <span>{info.desc(sub)}</span>
        </div>
      </div>
    </article>
  )
}
