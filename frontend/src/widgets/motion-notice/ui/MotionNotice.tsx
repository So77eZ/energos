'use client'

// Одноразовый баннер внизу экрана: объясняет, что часть анимаций урезана из-за
// системного prefers-reduced-motion или слабой графики, и направляет в профиль где их можно включить.
//
// Показывается только если: юзер сам не выбирал Вкл/Выкл (motion === null), анимации
// выключены (значит, по системе) И баннер не закрывали ранее. Закрытие — навсегда.
// Ждёт ответа на баннер Метрики: оба внизу экрана, иначе этот перекрывает его кнопки.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@shared/lib/theme'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { useAnalyticsConsentDecided } from '@shared/ui/AnalyticsConsent'

const STORAGE_KEY = 'energos_motion_notice'

export function MotionNotice() {
  const { motion, motionOn, lowGfx } = useTheme()
  // dismissed — «закрыто» на SSR/первом рендере, реальное значение из localStorage в effect.
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

  if (dismissed || !consentDecided || motion !== null || motionOn) return null

  return (
    <div className="motion-notice" role="status">
      <span>
        {lowGfx
          ? 'Браузер рисует сайт медленно, поэтому анимации и тяжёлые эффекты выключены. Анимации можно включить в'
          : 'Часть анимаций сайта урезана из-за системных настроек. Изменить поведение можно в'}{' '}
        <Link href={ROUTES.profile}>профиле</Link>.
      </span>
      <button type="button" className="motion-notice-close" onClick={close} aria-label="Закрыть">
        <Icons.x w={14} />
      </button>
    </div>
  )
}
