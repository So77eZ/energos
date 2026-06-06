'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { nextRevealCount, initialRevealCount } from './reveal'

const KEY = 'catalog_reveal'
// useLayoutEffect на сервере шумит warning'ом — изоморфный вариант.
const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface Stored { key: string; count: number }

export interface InfiniteReveal {
  count: number
  sentinelRef: React.RefObject<HTMLDivElement | null>
  showMore: () => void
  hasMore: boolean
}

export function useInfiniteReveal(
  { total, chunk, resetKey }: { total: number; chunk: number; resetKey: string },
): InfiniteReveal {
  // Детерминированный старт (= chunk) — одинаков на сервере и при гидратации
  // (без mismatch). Восстановление из sessionStorage — pre-paint в useIso ниже.
  const [count, setCount] = useState(() => initialRevealCount(null, chunk, total))
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const prevKey = useRef<string | null>(null)

  // Маунт: restore по совпадающему ключу (pre-paint → высота восстановлена до
  // прокрутки браузером). Смена resetKey (фильтр/сортировка) → сброс к chunk.
  useIso(() => {
    if (prevKey.current === resetKey) return
    const first = prevKey.current === null
    prevKey.current = resetKey
    if (first) {
      try {
        const raw = sessionStorage.getItem(KEY)
        const s = raw ? (JSON.parse(raw) as Stored) : null
        setCount(initialRevealCount(s && s.key === resetKey ? s.count : null, chunk, total))
      } catch {
        setCount(initialRevealCount(null, chunk, total))
      }
    } else {
      setCount(initialRevealCount(null, chunk, total))
    }
  }, [resetKey, chunk, total])

  // Персист текущего объёма (для back-навигации).
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ key: resetKey, count })) } catch { /* приват/SSR */ }
  }, [resetKey, count])

  const hasMore = count < total

  // Авто-раскрытие: sentinel в зоне видимости (+600px prefetch).
  // `count` в deps: после раскрытия observer пересоздаётся → повторный observe()
  // снова стрельнёт, если sentinel всё ещё в rootMargin (короткий контент не
  // выталкивает его) → цепочка догрузки до заполнения вьюпорта, без «застревания».
  useEffect(() => {
    if (!hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setCount((c) => nextRevealCount(c, chunk, total)) },
      { rootMargin: '600px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, chunk, total, count])

  const showMore = () => setCount((c) => nextRevealCount(c, chunk, total))

  return { count, sentinelRef, showMore, hasMore }
}
