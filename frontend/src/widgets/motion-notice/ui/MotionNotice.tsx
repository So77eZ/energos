'use client'

// Одноразовый баннер внизу экрана: объясняет, что часть анимаций урезана из-за
// системного prefers-reduced-motion, и направляет в профиль где это можно
// переопределить (theme.motion 'always'). См. motion-preference спеку.
//
// Показывается только если: система просит reduce-motion И юзер не включил
// оверрайд ('system') И баннер не закрывали ранее. Закрытие — навсегда.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@shared/lib/theme'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'

const STORAGE_KEY = 'energos_motion_notice'

export function MotionNotice() {
  const { motion } = useTheme()
  // Стартуем как «закрыто», чтобы SSR и первый клиентский рендер совпали (null);
  // реальное состояние подтягиваем в effect (matchMedia + localStorage — client-only).
  const [systemReduce, setSystemReduce] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemReduce(mq.matches)
    const onChange = () => setSystemReduce(mq.matches)
    mq.addEventListener('change', onChange)
    let stored = false
    try { stored = localStorage.getItem(STORAGE_KEY) != null } catch {}
    setDismissed(stored)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function close() {
    setDismissed(true)
    try { localStorage.setItem(STORAGE_KEY, 'dismissed') } catch {}
  }

  if (dismissed || !systemReduce || motion !== 'system') return null

  return (
    <div className="motion-notice" role="status">
      <span>
        Часть анимаций сайта урезана из-за системных настроек. Изменить поведение можно в{' '}
        <Link href={ROUTES.profile}>профиле</Link>.
      </span>
      <button type="button" className="motion-notice-close" onClick={close} aria-label="Закрыть">
        <Icons.x w={14} />
      </button>
    </div>
  )
}
