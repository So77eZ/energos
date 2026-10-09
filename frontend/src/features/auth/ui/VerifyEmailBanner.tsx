'use client'

import { useState, useTransition } from 'react'
import { useToast } from '@shared/lib/toast'
import { resendVerificationAction } from '../model/actions'

/** Бэк отвечает 403 на создание/правку отзывов, пока e-mail не подтверждён (docs/api.md). */
export function VerifyEmailBanner({ email }: { email: string }) {
  const { toast } = useToast()
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function resend() {
    startTransition(async () => {
      const res = await resendVerificationAction()
      if ('error' in res) {
        toast({ msg: res.error, kind: 'err' })
      } else {
        setSent(true)
        toast({ msg: 'Письмо отправлено', kind: 'ok' })
      }
    })
  }

  return (
    <section
      role="status"
      style={{
        padding: '14px 18px',
        margin: '16px 0',
        border: '1px solid var(--accent)',
        borderRadius: 12,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span>
        Подтвердите e-mail <b>{email}</b>, чтобы оставлять отзывы. Мы отправили письмо со ссылкой при регистрации.
      </span>
      <button type="button" className="cta-ghost" onClick={resend} disabled={isPending || sent}>
        {sent ? 'Письмо отправлено' : 'Отправить письмо ещё раз'}
      </button>
    </section>
  )
}
