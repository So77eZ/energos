'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { User } from '@entities/user'
import type { Submission } from '@entities/submission'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useMySubmissions } from '@features/submissions'
import { SubmitForm } from './SubmitForm'

interface SubmitPageProps {
  currentUser: User | null
}

export function SubmitPage({ currentUser }: SubmitPageProps) {
  const [submitted, setSubmitted] = useState<Submission | null>(null)
  const myCount = useMySubmissions(currentUser?.id ?? null).length

  // ── Not authenticated ──────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="page page-submit">
        <div className="submit-empty">
          <div className="submit-empty-icon"><Icons.lock w={28} /></div>
          <h1 className="page-title">Нужен вход</h1>
          <p className="page-blurb">Чтобы предложить новый напиток, войди или зарегистрируйся.</p>
          <Link href={ROUTES.auth.login} className="cta-primary">
            <Icons.lock w={14} /> Войти
          </Link>
        </div>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page page-submit">
        <div className="submit-success">
          <div className="submit-success-icon"><Icons.check w={36} /></div>
          <div className="page-eyebrow" style={{ color: 'var(--c-green)' }}>
            ЗАЯВКА ОТПРАВЛЕНА · №{submitted.id}
          </div>
          <h1 className="page-title">Спасибо!</h1>
          <p className="page-blurb">
            «{submitted.drink_name}» получил статус <b>В очереди</b>. Администратор посмотрит и одобрит или отклонит заявку.
            Следить за статусом можно в профиле.
          </p>
          <div className="submit-success-actions">
            <Link href={`${ROUTES.profile}?tab=submissions`} className="cta-primary">
              <Icons.beaker w={14} /> Мои заявки <Icons.arrow w={12} />
            </Link>
            <button type="button" className="cta-ghost" onClick={() => setSubmitted(null)}>
              <Icons.plus w={14} /> Подать ещё одну
            </button>
            <Link href={ROUTES.home} className="cta-ghost">
              К каталогу
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="page page-submit">
      <div className="submit-head">
        <div>
          <div className="page-eyebrow">ЗАЯВКА · ДОБАВЛЕНИЕ В КАТАЛОГ</div>
          <h1 className="page-title">Предложить энергетик</h1>
          <p className="page-blurb">
            Знаешь напиток, которого нет в базе? Расскажи о нём — администратор рассмотрит и добавит.
            Заполни обязательное поле «Название», остальное — на твоё усмотрение.
          </p>
        </div>
        <div className="submit-stat">
          <div className="submit-stat-val">{myCount}</div>
          <div className="submit-stat-lbl">твоих<br />заявок</div>
        </div>
      </div>

      <SubmitForm currentUser={currentUser} onSubmitted={setSubmitted} />
    </div>
  )
}
