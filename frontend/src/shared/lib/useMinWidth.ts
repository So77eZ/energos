'use client'

import { useEffect, useState } from 'react'

/**
 * Реактивный флаг `min-width: {px}px`.
 *
 * Стартует `false` (SSR + первый клиентский рендер), реальное значение —
 * в effect. Нужен чтобы НЕ грузить тяжёлый код (напр. three.js в ThreeCans)
 * на узких экранах: гейтим dynamic-import рендером `{wide && <Heavy/>}`,
 * тогда чанк качается только когда вьюпорт реально дорос до брейкпоинта.
 */
export function useMinWidth(px: number): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [px])
  return matches
}
