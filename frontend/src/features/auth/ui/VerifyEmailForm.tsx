'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ROUTES } from '@shared/config/routes'
import { verifyEmailAction } from '../model/actions'

// Подтверждение — по кнопке, а не при открытии страницы: почтовые сканеры ссылок
// ходят по GET и «съели» бы одноразовый токен до пользователя.
export function VerifyEmailForm({ token }: { token: string | null }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!token) {
    return <p className="auth-error">В ссылке нет токена подтверждения. Откройте ссылку из письма целиком.</p>
  }

  if (done) {
    return (
      <>
        <p className="auth-notice" role="status">E-mail подтверждён — теперь можно оставлять отзывы.</p>
        <Link href={ROUTES.home} className="cta-primary auth-submit">На главную</Link>
      </>
    )
  }

  function confirm() {
    startTransition(async () => {
      const res = await verifyEmailAction(token!)
      if ('error' in res) setError(res.error)
      else setDone(true)
    })
  }

  return (
    <>
      {error && <p className="auth-error">{error}</p>}
      <button type="button" className="cta-primary auth-submit" onClick={confirm} disabled={isPending}>
        {isPending ? 'Подтверждаем…' : 'Подтвердить e-mail'}
      </button>
    </>
  )
}
