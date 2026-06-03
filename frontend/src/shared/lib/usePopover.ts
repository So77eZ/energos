'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Закрывает поповер/дропдаун по клику вне контейнера, по Esc и при смене
 * маршрута. `ref` — на корневой элемент поповера (триггер + меню).
 *
 * Для модалок через портал (overlay onClick) этот хук не нужен — там dismiss
 * идёт по клику на оверлей; см. MobileNav/GachaponMachine.
 */
export function usePopover(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  const pathname = usePathname()
  // Держим свежий onClose в ref, чтобы не переподписывать слушатели на каждый
  // рендер (типичный onClose — инлайновая стрелка).
  const cb = useRef(onClose)
  cb.current = onClose

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, ref])

  // Закрыть при смене маршрута.
  useEffect(() => {
    cb.current()
  }, [pathname])
}
