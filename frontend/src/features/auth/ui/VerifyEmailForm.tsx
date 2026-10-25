'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ROUTES } from '@shared/config/routes'
import { verifyEmailAction } from '../model/actions'

// Подтверждаем сразу при открытии ссылки — без кнопки. Запрос уходит из браузера (эффект),
// а не при рендере на сервере: почтовые сканеры ссылок обычно только скачивают страницу и JS
// не выполняют. Если сканер всё же подтвердит первым, бэк ответит «уже подтверждён» —
// verifyEmailAction считает это успехом, и пользователь увидит то же самое.
export function VerifyEmailForm({ token }: { token: string | null }) {
  const [state, setState] = useState<'pending' | 'done' | { error: string }>('pending')
  // В dev StrictMode вызывает эффект дважды — второй запрос не нужен.
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    verifyEmailAction(token)
      .then((res) => setState('error' in res ? { error: res.error } : 'done'))
      .catch(() => setState({ error: 'Не удалось связаться с сервером. Обновите страницу.' }))
  }, [token])

  if (!token) {
    return <p className="auth-error">В ссылке нет токена подтверждения. Откройте ссылку из письма целиком.</p>
  }

  if (state === 'pending') {
    return <p className="auth-notice" role="status">Подтверждаем e-mail…</p>
  }

  if (state === 'done') {
    return (
      <>
        <p className="auth-notice" role="status">E-mail подтверждён — теперь можно оставлять отзывы.</p>
        <Link href={ROUTES.home} className="cta-primary auth-submit">На главную</Link>
      </>
    )
  }

  return <p className="auth-error" role="alert">{state.error}</p>
}
