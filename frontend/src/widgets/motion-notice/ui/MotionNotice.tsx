'use client'

// Одноразовый баннер внизу экрана: объясняет, что часть анимаций урезана из-за
// системного prefers-reduced-motion, и направляет в профиль где это можно
// переопределить (theme.motion 'always'). См. motion-preference спеку.
//
// Показывается только если: система просит reduce-motion И юзер не включил
// оверрайд ('system') И баннер не закрывали ранее. Закрытие — навсегда.
// Ждёт ответа на баннер Метрики: оба внизу экрана, иначе этот перекрывает его кнопки.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@shared/lib/theme'
import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { useAnalyticsConsentDecided } from '@shared/ui/AnalyticsConsent'

const STORAGE_KEY = 'energos_motion_notice'

export function MotionNotice() {
  const { motion } = useTheme()
  // systemReduce стартует false (hydration-safe, см. хук); dismissed — тоже
  // «закрыто» на SSR/первом рендере, реальное значение из localStorage в effect.
  const systemReduce = usePrefersReducedMotion()
  const [dismissed, setDismissed] = useState(true)
  const consentDecided = useAnalyticsConsentDecided()

  useEffect(() => {
    let stored = false
    try { stored = localStorage.getItem(STORAGE_KEY) != null } catch {}
    setDismissed(stored)
  }, [])

  function close() {
    setDismissed(true)
    try { localStorage.setItem(STORAGE_KEY, 'dismissed') } catch {}
  }

  if (dismissed || !consentDecided || !systemReduce || motion !== 'system') return null

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
