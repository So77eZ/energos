'use client'

import { useEffect, useState } from 'react'

/**
 * Системная настройка `prefers-reduced-motion: reduce` как реактивный флаг.
 *
 * Стартует `false` (и на SSR, и на первом клиентском рендере) — чтобы не словить
 * hydration mismatch у компонентов, чья разметка зависит от флага; реальное
 * значение подтягивается в effect и обновляется на смену системной настройки.
 *
 * NB: где нужно СИНХРОННО-корректное значение на маунте (напр. ThreeCans, чтобы
 * не ремаунтить WebGL-сцену), используется локальный lazy-init вместо этого хука.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
